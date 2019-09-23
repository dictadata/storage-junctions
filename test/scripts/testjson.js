"use strict";

const transfer = require('./_transfer');

console.log("=== Test: json");

async function tests() {
  await transfer({
    src_smt: "json|./test/data/|testfile.json|*",
    dst_smt: "json|./test/output/|testoutput.json|*"
  });
}

tests();
