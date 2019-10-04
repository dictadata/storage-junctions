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
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!userid"
    },
    OutputFile: './test/output/elasticsearch_foo_encoding.json'
  });

  logger.info("=== elasticsearch putEncoding");
  await putEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo"
    }
  });

  logger.info("=== elasticsearch store");
  let uid = await store({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== elasticsearch recall uid");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|" + uid }
  });

  logger.info("=== elasticsearch recall !");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!",
      options: {
        key: uid
      }
    }
  });

  logger.info("=== elasticsearch recall !Foo");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo",
      options: {
        Foo: uid
      }
    }
  });

  logger.info("=== elasticsearch recall =Foo");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|=Foo",
      options: {
        Foo: uid
      }
    }
  });

  logger.info("=== elasticsearch retrieve");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*",
      options: {
        pattern: {
          filter: {
            "Foo": 'twenty'
          }
        }
      }
    }
  });

  logger.info("=== elasticsearch retrieve with pattern");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*",
      options: {
        pattern: {
          filter: {
            "Foo": "first",
            "Baz": { "gte": 0, "lte": 1000 }
          },
          cues: {
            count: 3,
            order: { "Dt Test": "asc" },
            fields: ["Foo", "Baz"]
          }
        }
      }
    }
  });

  logger.info("=== elasticsearch dull");
  await dull({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo",
      options: {
        Foo: 'twenty'
      }
    }
  });

  logger.info("=== csv => elasticsearch");
  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*"
    }
  });

  logger.info("=== elasticsearch => elasticsearch");
  await transfer({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*"
    },
    destination: {
      smt: "elasticsearch|http://localhost:9200|test_transfer|*"
    }
  });

  logger.info("=== elasticsearch => csv");
  await transfer({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_transfer|*"
    },
    destination: {
      smt: "csv|./test/output/|elastic_output.csv|*"
    }
  });

}

tests();
