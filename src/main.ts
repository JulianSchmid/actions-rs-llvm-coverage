import * as fs from "fs";
import * as glob from "glob";
//import * as util from "util";
import * as path from "path";

import * as core from "@actions/core";
import { mkdirP } from "@actions/io";

import { Cargo, Cross } from "@actions-rs/core";

import * as input from "./input";
import * as cargo_message from "../src/cargo_message";

//const openAsync = promisify(fs.open);

export async function run(actionInput: input.Input): Promise<void> {
    let program;
    if (actionInput.useCross) {
        program = await Cross.getOrInstall();
    } else {
        program = await Cargo.get();
    }

    // env & args for commands
    const prefix = "coverage-";
    const env = {
        RUSTFLAGS: "-Zinstrument-coverage",
        LLVM_PROFILE_FILE: prefix+"%m.profraw",
        ...process.env
    };

    // TODO add doctest support

    let test_args: string[] = [
        "+nightly",
        "test",
        "--tests",
    ];

    // run the instrumented tests
    await program.call(test_args, {env: env});

    // collect executable names
    let artifacts: string[] = [];
    const options = {
        silent: true,
        listeners: {
            stdline: (data: string) => {
                let msg = cargo_message.fromJson(data);
                if (
                    msg.kind === cargo_message.Kind.CompilerArtifact &&
                    msg.profile.test
                ) {
                    for (let f of msg.filenames) {
                        if (!f.endsWith(".dSYM")) {
                            artifacts.push(f);
                        }
                    }
                }
            }
        },
        env: env
    };

    await program.call(
        [
            ...test_args,
            "--no-run",
            "--message-format=json",
        ],
        options
    );

    console.log(`Identified the following executables:`);
    for (let f of artifacts) {
        console.log(`    ${f}`)
    }

    // merge the coverages from the different executables
    await program.call(
        [
            "+nightly",
            "profdata",
            "--",
            "merge",
            "--sparse",
            ...glob.sync("**/"+prefix+"*.profraw"),
            "-o",
            "summary.profdata"
        ]
    );

    // print coverage summary
    let cov_args = [
        "--ignore-filename-regex='/.cargo/registry'",
        "--instr-profile=summary.profdata",
    ];
    for (let f of artifacts) {
        cov_args.push("--object");
        cov_args.push(f)
    }
    await program.call(
        [
            "+nightly",
            "cov",
            "--",
            "report",
            "--use-color",
            ...cov_args,
            "--summary-only",
        ]
    );

    // generate file for codecov
    let codecovPath = "target/codecov";
    mkdirP(codecovPath);
    let codecovOut = fs.createWriteStream(path.join(codecovPath, "codecov.txt"));
    await program.call(
        [
            "+nightly",
            "cov",
            "--",
            "export",
            ...cov_args,
            "--format=text",
            "--Xdemangler=rustfilt",
        ],
        {
            outStream: codecovOut,
        }
    )

    /*cargo cov -- show \
    --use-color --ignore-filename-regex='/.cargo/registry' \
    --instr-profile=json5format.profdata \
    --object target/debug/deps/lib-30768f9c53506dc5 \
    --object target/debug/deps/json5format-fececd4653271682 \
    --show-instantiations --show-line-counts-or-regions \
    --Xdemangler=rustfilt*/
}

async function main(): Promise<void> {
    const actionInput = input.get();

    try {
        await run(actionInput);
    } catch (error) {
        core.setFailed((<Error>error).message);
    }
}

void main();