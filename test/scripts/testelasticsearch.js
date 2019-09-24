/**
 * test/elasticsearch
 */
"use strict";

const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const transfer = require('./_transfer');

console.log("=== Tests: elasticsearch");

async function tests() {

  console.log("=== elasticsearch store");
  await store({
    src_smt: "elasticsearch|http://localhost:9200|test_input|=Foo",
    construct: {}
  });

  console.log("=== elasticsearch recall");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_input|=Foo",
    key: 1
  });

  console.log("=== elasticsearch retrieve");
  await retrieve({
    src_smt: "elasticsearch|http://localhost:9200|test_input|*",
    pattern: { filter: {} }
  });


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
