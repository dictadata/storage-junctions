/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('./_transfer');

console.log("=== Tests: elasticsearch");

async function tests() {

  console.log("=== csv => elasticsearch");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "elasticsearch|http://localhost:9200|test_input|*"
  });

  console.log("=== elasticsearch => elasticsearch");
  await transfer({
    src_smt: "elasticsearch|http://localhost:9200|test_input|*",
    dst_smt: "elasticsearch|http://localhost:9200|test_output|*"
  });

  console.log("=== elasticsearch => csv");
  await transfer({
    src_smt: "elasticsearch|http://localhost:9200|test_output|*",
    dst_smt: "csv|./test/output/|elastic_output.csv|*"
  });

}

tests();
