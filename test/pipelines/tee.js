/**
 * test/json
 */
"use strict";

const tee = require('../_lib/_tee');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: pipeline tee");

async function tests() {

  logger.verbose('=== foo_schema > pipelines/tee_1.json, pipelines/tee_2.json');
  if (await tee({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema.engram.json"
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
        smt: "json|./test/_data/output/pipelines/|tee_1.json|*",
        options: {
          encoding: "./test/_data/input/engrams/foo_schema.engram.json"
        },
        output: "./test/_data/output/pipelines/tee_1.json"

      },
      {
        smt: "json|./test/_data/output/pipelines/|tee_2.json|*",
        options: {
          encoding: "./test/_data/input/engrams/foo_transform.engram.json"
        },
        output: "./test/_data/output/pipelines/tee_2.json"
      }
    ]


  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
