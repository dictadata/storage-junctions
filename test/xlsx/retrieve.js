/**
 * test/xlsx/retrieve
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== xlsx retrieve");
  await retrieve({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
      pattern: {
        match: {
          "Foo": 'twenty'
        }
      },
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx retrieve with pattern");
  await retrieve({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo_transfer|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        cues: {
          count: 3,
          order: { "Dt Test": "asc" },
          fields: ["Foo","Baz"]
        }
      },
      options: {
        logger: logger
      }
    }
  });

}

tests();
