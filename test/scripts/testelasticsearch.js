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
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch getEncoding");
  await getEncoding({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!userid",
    OutputFile: './test/output/accounts_encoding.json'
  });


  logger.info("=== elasticsearch putEncoding");
  await putEncoding({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo"
  });

  logger.info("=== elasticsearch store");
  let uid = await store({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo",
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== elasticsearch recall uid");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|" + uid
  });

  logger.info("=== elasticsearch recall !");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!",
    options: {
      key: uid
    }
  });

  logger.info("=== elasticsearch recall !Foo");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo",
    options: {
      Foo: uid
    }
  });

  logger.info("=== elasticsearch recall =Foo");
  await recall({
    src_smt: "elasticsearch|http://localhost:9200|test_index|=Foo",
    options: {
      Foo: uid
    }
  });

  logger.info("=== elasticsearch retrieve");
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

  logger.info("=== elasticsearch dull");
  await dull({
    src_smt: "elasticsearch|http://localhost:9200|test_index|!Foo",
    options: {
      Foo: 'twenty'
    }
  });

  logger.info("=== csv => elasticsearch");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "elasticsearch|http://localhost:9200|test_index|*"
  });

  logger.info("=== elasticsearch => elasticsearch");
  await transfer({
    src_smt: "elasticsearch|http://localhost:9200|test_index|*",
    dst_smt: "elasticsearch|http://localhost:9200|test_output|*"
  });

  logger.info("=== elasticsearch => csv");
  await transfer({
    src_smt: "elasticsearch|http://localhost:9200|test_output|*",
    dst_smt: "csv|./test/output/|elastic_output.csv|*"
  });

}

tests();
