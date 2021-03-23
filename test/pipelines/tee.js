/**
 * test/json
 */
"use strict";

const tee = require('../lib/_tee');
const logger = require('../../lib/logger');

logger.info("=== Test: pipeline tee");

async function tests() {

  logger.verbose('=== foo_schema > pipelines/tee_1.json, pipelines/tee_2.json');
  let tract = {
    origin: {
      smt: "json|./test/data/|foofile.json|*",
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
          smt: "json|./output/pipelines/|tee_1.json|*",
          options: {
            encoding: "./test/data/encoding_foo.json"
          }
        },
        transforms: {
        }
      },
      {
        terminal: {
          smt: "json|./output/pipelines/|tee_2.json|*",
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
