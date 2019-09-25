/**
 * test/csv
 */
"use strict";

const transfer = require('./_transfer');

console.log("=== Test: csv");

async function tests() {
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "csv|./test/output/|csv_output.csv|*"
  });
}

tests();
