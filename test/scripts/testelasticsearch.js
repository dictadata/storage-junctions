/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('./_getEncoding');
const putEncoding = require('./_putEncoding');
const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const transfer = require('./_transfer');
const dull = require('./_dull');

console.log("=== Tests: elasticsearch");

async function tests() {

  console.log("=== elasticsearch getEncoding");
  await getEncoding({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!userid",
    OutputFile: './test/output/accounts_encoding.json'
  });


  console.log("=== elasticsearch putEncoding");
  await putEncoding({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo"
  });

  console.log("=== elasticsearch store");
  let uid = await store({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo",
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  console.log("=== elasticsearch recall uid");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|" + uid
  });

  console.log("=== elasticsearch recall !");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!",
    options: {
      key: uid
    }
  });

  console.log("=== elasticsearch recall !Foo");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo",
    options: {
      Foo: uid
    }
  });

  console.log("=== elasticsearch recall =Foo");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|=Foo",
    options: {
      Foo: uid
    }
  });

  console.log("=== elasticsearch retrieve");
  await retrieve({
    src_smt: "elasticsearch|http://localhost:9200|test_index|*",
    options: {
      pattern: {
        filter: {
          "Foo": 'twenty'
        }
      }
    }
  });

  console.log("=== elasticsearch dull");
  await dull({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo",
    options: {
      Foo: 'twenty'
    }
  });

  console.log("=== csv => elasticsearch");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "elasticsearch|http://localhost:9200|test_index|*"
  });

  console.log("=== elasticsearch => elasticsearch");
  await transfer({
    src_smt: "elasticsearch|http://localhost:9200|test_index|*",
    dst_smt: "elasticsearch|http://localhost:9200|test_output|*"
  });

  console.log("=== elasticsearch => csv");
  await transfer({
    src_smt: "elasticsearch|http://localhost:9200|test_output|*",
    dst_smt: "csv|./test/output/|elastic_output.csv|*"
  });

}

tests();
