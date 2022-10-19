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
      smt: "json|./data/input/|foofile.json|*",
      options: {
        encoding: "./data/input/foo_schema.encoding.json"
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
          smt: "json|./data/output/pipelines/|tee_1.json|*",
          options: {
            encoding: "./data/input/foo_schema.encoding.json"
          },
          output: "./data/output/pipelines/tee_1.json"
        },
        transform: {
        }
      },
      {
        terminal: {
          smt: "json|./data/output/pipelines/|tee_2.json|*",
          options: {
            encoding: "./data/input/foo_transform.encoding.json"
          },
          output: "./data/output/pipelines/tee_2.json"
        },
        transform: {
          mutate: {
            select: [ "Dt Test", "Foo", "Baz" ]
          }
        }
      }
    ]
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
