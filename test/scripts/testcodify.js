"use strict";

const codify = require('./_codify');

console.log("=== tests: Codify");

async function tests() {
  await codify({
    src_smt: "csv|./test/data/|testfile.csv|*"
  });
}

tests();
