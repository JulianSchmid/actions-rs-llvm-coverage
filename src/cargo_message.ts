
export enum Kind {
    CompilerArtifact,
    BuildFinished,
    Unknown,
    // The following two cargo messages are not implemented:
    // * CompilerMessage
    // * BuildScriptExecuted,
}

export interface Target {
    name: string;
    kind: string[];
    doc: boolean;
    doctest: boolean;
    test: boolean;
}

/// Profile settings used to determine which compiler flags to use for a
/// target.
export interface ArtifactProfile {
    opt_level: string,
    debuginfo?: number,
    debug_assertions: boolean,
    overflow_checks: boolean,
    test: boolean,
}

// A compiler-generated file.
export interface CompilerArtifact {
    kind: Kind.CompilerArtifact
    reason: string;
    package_id: string;
    target: Target;
    profile: ArtifactProfile;
    features: string[];
    filenames: string[];
    executable?: string;
    fresh: boolean;
}

export interface BuildFinished {
    kind: Kind.BuildFinished;
    reason: string;
    success: boolean;
}

/// Any message returned by cargo with reason that is
/// currently not supported.
export interface Unknown {
    kind: Kind.Unknown;
    reason: string;
}

type Message =
    | CompilerArtifact
    | BuildFinished
    | Unknown;

export function fromJson(json: string): Message {
    return fromAny(JSON.parse(json));
}

export function fromAny(obj: any): Message {
    switch(obj.reason) {
        case "compiler-artifact": {
            if (isCompilerArtifact(obj)) {
                obj.kind = Kind.CompilerArtifact;
                return obj;
            } else {
                throw new Error('compiler-artifact is not matching expected format');
            }
            break;
        }
        case "build-finished": {
            if (isBuildFinished(obj)) {
                obj.kind = Kind.BuildFinished;
                return obj;
            } else {
                throw new Error('build-finished is not matching expected format');
            }
            break;
        }
        default: {
            if (typeof obj.reason === "string") {
                obj.kind = Kind.Unknown;
                return obj;
            }
            return {
                kind: Kind.Unknown,
                reason: obj.reason
            }
        }
    }
}

function isBuildFinished(obj: any): obj is BuildFinished {
    return (
        typeof obj.reason === "string" && 
        typeof obj.success === "boolean"
    );
}

function isCompilerArtifact(obj: any): obj is CompilerArtifact {
    return (
        typeof obj.reason === "string" &&
        typeof obj.package_id === "string" &&
        isTarget(obj.target) &&
        isArtifactProfile(obj.profile) &&
        isStringArray(obj.features) &&
        isStringArray(obj.filenames) &&
        (
            obj.executable === null ||
            typeof obj.executable == "string"
        ) &&
        typeof obj.fresh === "boolean"
    );
}

function isTarget(obj: any): obj is Target {
    return (
        typeof obj.name === "string" &&
        isStringArray(obj.kind) &&
        typeof obj.doc === "boolean" &&
        typeof obj.doctest === "boolean" &&
        typeof obj.test === "boolean"
    );
}

function isArtifactProfile(obj: any): obj is ArtifactProfile {
    return (
        typeof obj.opt_level === "string" &&
        (
            obj.debuginfo === null ||
            typeof obj.debuginfo === "number"
        ) &&
        typeof obj.debug_assertions === "boolean" &&
        typeof obj.overflow_checks === "boolean" &&
        typeof obj.test === "boolean"
    );
}

function isStringArray(obj: any): obj is string[] {
    if (!Array.isArray(obj)) {
        return false;
    }
    for (let entry of obj) {
        if (typeof entry !== "string") {
            return false;
        }
    }
    return true;
}
