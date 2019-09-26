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
  let id = await store({
    src_smt: "elasticsearch|http://localhost:9200|test_input|=Foo",
    construct: {
      Foo: 'twenty',
      Bar: 123,
      Biz: 99.9
    }
  });

  console.log("=== elasticsearch recall");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_input|" + id
  });

  console.log("=== elasticsearch recall");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_input|=Foo",
    options: {
      id: id
    }
  });

  console.log("=== elasticsearch retrieve");
  await retrieve({
    src_smt: "elasticsearch|http://localhost:9200|test_input|*",
    pattern: {
      filter: {
        "Foo": 'twenty'
      }
    }
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
