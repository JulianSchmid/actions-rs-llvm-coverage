import { input } from "@actions-rs/core";

// Parsed action input
export interface Input {
    useCross: boolean;
}

export function get(): Input {

    const useCross = input.getInputBool("use-cross");

    return {
        useCross: useCross,
    };
}