/**
 * test/csv
 */
"use strict";

const transfer = require('./_transfer');

console.log("=== Test: csv");

async function tests() {
  console.log('./test/data/testfile.csv');

  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "csv|./test/output/|csv_output.csv|*"
  });

  console.log('./test/output/csv_output.csv');
}

tests();
