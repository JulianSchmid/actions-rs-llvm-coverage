cargo clean
rm merge.profdata
rm rust_test_project/coverage-*.profraw
rm -rf results
mkdir -p results

RUSTFLAGS="-Zinstrument-coverage" \
    LLVM_PROFILE_FILE="coverage-%m.profraw" \
    cargo +nightly test --tests

RUSTFLAGS="-Zinstrument-coverage" \
    LLVM_PROFILE_FILE="coverage-%m.profraw" \
cargo +nightly test --no-run --message-format=json | jq -r "select(.profile.test == true) | .filenames[]" | grep -v dSYM - > results/filenames.txt

cargo profdata -- merge -sparse rust_test_project/coverage-*.profraw -o results/merge.profdata

cargo cov -- report \
    --use-color \
    --summary-only \
    --Xdemangler=rustfilt \
    --ignore-filename-regex='/.cargo/registry' \
    --instr-profile=results/merge.profdata \
    $(printf -- "-object %s " $(cat results/filenames.txt))

cargo cov -- show --format=html \
    --Xdemangler=rustfilt \
    --ignore-filename-regex='/.cargo/registry' \
    --instr-profile=results/merge.profdata \
    $(printf -- "-object %s " $(cat results/filenames.txt)) \
  > results/show.html

cargo cov -- export --format=lcov \
    --Xdemangler=rustfilt \
    --ignore-filename-regex='/.cargo/registry' \
    --instr-profile=results/merge.profdata \
    $(printf -- "-object %s " $(cat results/filenames.txt)) \
  > results/export.lcov.txt

cargo cov -- export --format=text \
    --Xdemangler=rustfilt \
    --ignore-filename-regex='/.cargo/registry' \
    --instr-profile=results/merge.profdata \
    $(printf -- "-object %s " $(cat results/filenames.txt)) \
  > results/export.txt