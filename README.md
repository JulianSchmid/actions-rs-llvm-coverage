# actions-rs-llvm-coverage

![example workflow name](https://github.com/JulianSchmid/actions-rs-llvm-coverage/workflows/test-runs/badge.svg)

This GitHub Action runs the `cargo test` command on a Rust language project and calculates the source based code coverage of the tests.

## Example workflow

```yaml
name: codecoverage

on: [ push, pull_request ]

jobs:
  test_coverage:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - uses: actions-rs/toolchain@v1.0.6
      with:
        toolchain: nightly
        components: llvm-tools-preview
    - uses: actions-rs/cargo@v1
      with:
        command: install
        toolchain: nightly
        args: cargo-binutils
    - name: cargo test coverage (source based)
      uses: JulianSchmid/actions-rs-llvm-coverage@v1
```

## Arguments

| Name        | Required | Description                                                              | Type   | Default |
| ------------| :------: | -------------------------------------------------------------------------| ------ | --------|
| `use-cross` |          | Use [`cross`](https://github.com/rust-embedded/cross) instead of `cargo` | bool   | false   |

## References

* [The Rust Unstable Book: source-based-code-coverage](https://doc.rust-lang.org/nightly/unstable-book/compiler-flags/source-based-code-coverage.html)
* [Rust Blog Post: Source-based code coverage in nightly](https://blog.rust-lang.org/inside-rust/2020/11/12/source-based-code-coverage.html)
* [`cargo_metadata` crate](https://github.com/oli-obk/cargo_metadata)
* [Rust Blog Post: Source-based code coverage in nightly](https://blog.rust-lang.org/inside-rust/2020/11/12/source-based-code-coverage.html)
