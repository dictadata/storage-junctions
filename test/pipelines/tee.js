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
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
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
          smt: "json|./output/pipelines/|xlsx_tee_1.json|*",
          options: {
            encoding: "./test/data/encoding_foo.json"
          }
        },
        transforms: {
        }
      },
      {
        terminal: {
          smt: "json|./output/pipelines/|xlsx_tee_2.json|*",
          options: {
            encoding: "./test/data/encoding_foo_transform.json"
          }
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

(async () => {
  await tests();
})();
