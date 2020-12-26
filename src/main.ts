//import path from "path";

import * as core from "@actions/core";

import * as input from "./input";
import { Cargo, Cross } from "@actions-rs/core";

/*
function getEnv(): {} {
    process.env
}*/

export async function run(actionInput: input.Input): Promise<void> {
    let program;
    if (actionInput.useCross) {
        program = await Cross.getOrInstall();
    } else {
        program = await Cargo.get();
    }

    // build the tests and collect the executable names
    let args: string[] = [
        "test",
        "--tests",
        "--no-run",
        "--message-format=json"
    ];

    let artifactsJson = '';
    const options = {
        listeners: {
            stdout: (data: Buffer) => {
                artifactsJson += data.toString();
            }
        },

    };

    // TODO add environment variables for instrumentation

    await program.call(args, options);

    console.log(`The resulted json is: ${artifactsJson}`);
    console.log(`${process.env}`)

    // TODO decode the artifact paths

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