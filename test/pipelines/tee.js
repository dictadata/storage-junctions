/**
 * test/json
 */
"use strict";

const tee = require('../lib/_tee');
const { logger } = require('../../storage/utils');

logger.info("=== Test: pipeline tee");

async function tests() {

  logger.verbose('=== foo_schema > pipelines/tee_1.json, pipelines/tee_2.json');
  if (await tee({
    origin: {
      smt: "json|./test/data/|foofile.json|*",
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
    },
    transform: {
      filter: {
        match: {
          "Baz": { "lte": 500 }
        }
      }
    },
    terminal: [
      {
        terminal: {
          smt: "json|./test/data/output/pipelines/|tee_1.json|*",
          options: {
            encoding: "./test/data/encoding_foo.json"
          }
        },
        transform: {
        }
      },
      {
        terminal: {
          smt: "json|./test/data/output/pipelines/|tee_2.json|*",
          options: {
            encoding: "./test/data/encoding_foo_transform.json"
          }
        },
        transform: {
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
