/**
 * test/json
 */
"use strict";

const transfer = require('./_transfer');

console.log("=== Test: json");

async function tests() {
  console.log('./test/data/testfile.json');

  await transfer({
    src_smt: "json|./test/data/|testfile.json|*",
    dst_smt: "json|./test/output/|json_output.json|*"
  });

  console.log('./test/output/json_output.json');
}

tests();
