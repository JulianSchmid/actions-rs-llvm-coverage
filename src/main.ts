import path from "path";

import * as core from "@actions/core";

import * as input from "./input";
import { Cargo, Cross } from "@actions-rs/core";

export async function run(actionInput: input.Input): Promise<void> {
    let program;
    if (actionInput.useCross) {
        program = await Cross.getOrInstall();
    } else {
        program = await Cargo.get();
    }

    let args: string[] = ["test"];

    await program.call(args);
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