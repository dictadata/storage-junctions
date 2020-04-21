/**
 * test/json
 */
"use strict";

const tee = require('../lib/_tee');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx tee");

async function tests() {

  logger.verbose('=== xlsx > xlsx_tee_1.json, xlsx_tee_2.json');
  let tract = {
    origin: {
      smt: "xlsx|./test/data/foofile.xlsx|foo|*",
      encoding: "./test/data/foo_encoding.json"
    },
    transforms: {
      filter: {
        match: {
          "Baz": { "lte": 500 }
        }
      }
    },
    terminal: [
      {
        terminal: {
          smt: "json|./test/output/|xlsx_tee_1.json|*",
          encoding: "./test/data/foo_encoding.json"
        },
        transforms: {
        }
      },
      {
        terminal: {
          smt: "json|./test/output/|xlsx_tee_2.json|*",
          encoding: "./test/data/foo_encoding_t.json"
        },
        transforms: {
          select: {
            fields: ["Dt Test", "Foo", "Baz"]
          }
        }
      }
    ]
  };
  await tee(tract);
}

tests();
