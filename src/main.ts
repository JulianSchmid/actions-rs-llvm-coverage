//import path from "path";

import * as core from "@actions/core";

import * as input from "./input";
import * as cargo_message from "../src/cargo_message";
import { Cargo, Cross } from "@actions-rs/core";

export async function run(actionInput: input.Input): Promise<void> {
    let program;
    if (actionInput.useCross) {
        program = await Cross.getOrInstall();
    } else {
        program = await Cargo.get();
    }

    // env & args for commands
    const env = {
        RUSTFLAGS: "-Zinstrument-coverage",
        LLVM_PROFILE_FILE: "coverage-%m.profraw",
        ...process.env
    };

    // TODO add doctest support

    let test_args: string[] = [
        "test",
        "--tests",
    ];

    // run the instrumented tests
    await program.call(test_args, {env: env});

    // merge the coverages from the different runnables
    // TODO

    // collect executable names
    let artifacts: string[] = [];
    const options = {
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

    console.log(`Identified the following artifacts:`);
    for (let f of artifacts) {
        console.log(`    ${f}`)
    }

    // TODO print coverage summary

    // TODO generate file for codecov
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