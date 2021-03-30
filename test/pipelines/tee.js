/**
 * test/json
 */
"use strict";

const tee = require('../lib/_tee');
const logger = require('../../storage/logger');

logger.info("=== Test: pipeline tee");

async function tests() {

  logger.verbose('=== foo_schema > pipelines/tee_1.json, pipelines/tee_2.json');
  if (await tee({
    origin: {
      smt: "json|./data/test/|foofile.json|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
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
          smt: "json|./data/output/pipelines/|tee_1.json|*",
          options: {
            encoding: "./data/test/encoding_foo.json"
          }
        },
        transforms: {
        }
      },
      {
        terminal: {
          smt: "json|./data/output/pipelines/|tee_2.json|*",
          options: {
            encoding: "./data/test/encoding_foo_transform.json"
          }
        },
        transforms: {
          select: {
            fields: ["Dt Test", "Foo", "Baz"]
          }
        }
      }
    ]
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
