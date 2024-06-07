/**
 * test/json
 */
"use strict";

const tee = require('../lib/_tee');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: pipeline tee");

async function tests() {

  logger.verbose('=== foo_schema > pipelines/tee_1.json, pipelines/tee_2.json');
  if (await tee({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      options: {
        encoding: "./test/data/input/engrams/foo_schema.engram.json"
      }
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Baz": { "lte": 500 }
        }
      }
    ],
    terminals: [
      {
        smt: "json|./test/data/output/pipelines/|tee_1.json|*",
        options: {
          encoding: "./test/data/input/engrams/foo_schema.engram.json"
        },
        output: "./test/data/output/pipelines/tee_1.json"

      },
      {
        smt: "json|./test/data/output/pipelines/|tee_2.json|*",
        options: {
          encoding: "./test/data/input/engrams/foo_transform.engram.json"
        },
        output: "./test/data/output/pipelines/tee_2.json"
      }
    ]


  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
