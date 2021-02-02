/**
 * test/oracle
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle");

async function tests() {

  logger.info("=== oracle retrieve");
  await retrieve({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./test/output/oracle_retrieve_0.json"
    }
  });

  logger.info("=== oracle retrieve");
  await retrieve({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*",
      encoding: "./test/data/encoding_foo_01.json",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./test/output/oracle_retrieve_1.json"
    }
  });

  logger.info("=== oracle retrieve");
  await retrieve({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*",
      encoding: "./test/data/encoding_foo_02.json",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./test/output/oracle_retrieve_2.json"
    }
  });

  logger.info("=== oracle retrieve w/ cues");
  await retrieve({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    }
  });

  logger.info("=== oracle retrieve with pattern");
  await retrieve({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        count: 3,
        order: { "Dt Test": "asc" },
        fields: ["Foo", "Baz"]
      }
    }
  });

}

tests();
