import * as cargo_message from "../src/cargo_message";

test('fromJson unknown', () => {
    let result = cargo_message.fromJson(
        JSON.stringify(
            { reason: "something" }
        )
    )
    expect(result.kind)
    .toBe(cargo_message.Kind.Unknown);

    expect(result.reason)
    .toBe("something");
});

test('fromJson build-finished', () => {
    let data = [ true, false ];

    for (let success of data) {
        let result = cargo_message.fromJson(
            JSON.stringify(
                {
                    reason: "build-finished",
                    success: success
                }
            )
        );
        expect(result.kind)
        .toBe(cargo_message.Kind.BuildFinished);
        switch (result.kind) {
            case cargo_message.Kind.BuildFinished:
            {
                expect(result.reason).toBe("build-finished");
                expect(result.success).toBe(success);
                break;
            }
            default:
            {
                // should be a matching type
                expect(true).toBe(false);
            }
        }
    }
});

test('fromJson compiler-artifact', () => {
    const e = {
        "reason": "compiler-artifact",
        "package_id": "rust_test_project 0.1.0 (path+file:///workspaces/rust/actions-rs-coverage/rust_test_project)",
        "target": {
            "kind": [
                "test"
            ],
            "crate_types": [
                "bin"
            ],
            "name": "integration_tests",
            "src_path": "/workspaces/rust/actions-rs-coverage/rust_test_project/tests/integration_tests.rs",
            "edition": "2018",
            "doc": false,
            "doctest": false,
            "test": true
        },
        "profile": {
            "opt_level": "0",
            "debuginfo": 2,
            "debug_assertions": true,
            "overflow_checks": true,
            "test": true
        },
        "features": [],
        "filenames": [
            "/workspaces/rust/actions-rs-coverage/target/debug/deps/integration_tests-67d5832c2b7409e3",
            "/workspaces/rust/actions-rs-coverage/target/debug/deps/integration_tests-67d5832c2b7409e3.dSYM"
        ],
        "executable": "/workspaces/rust/actions-rs-coverage/target/debug/deps/integration_tests-67d5832c2b7409e3",
        "fresh": true
    };
    let result = cargo_message.fromJson(JSON.stringify(e));

    expect(result.kind)
        .toBe(cargo_message.Kind.CompilerArtifact);

    if (result.kind === cargo_message.Kind.CompilerArtifact) {
        expect(result.package_id).toBe(e.package_id);
    } else {
        // should be a matching type
        expect(true).toBe(false);
    }
});
