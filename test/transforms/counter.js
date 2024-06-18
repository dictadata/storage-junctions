/**
 * test/json
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: counter transform");

async function tests() {

  logger.info("=== add counter");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*"
    },
    transforms: [
      {
        transform: "counter"
      }
    ],
    terminal: {
      "smt": 'json|./test/_data/output/transforms/|counter_1.json|*',
      "output": "./test/_data/output/transforms/counter_1.json"
    }
  })) return 1;

  logger.info("=== rename counter");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*"
    },
    transforms: [
      {
        transform: "counter",
        name: "__increment"
      }
    ],
    terminal: {
      "smt": 'json|./test/_data/output/transforms/|counter_rename.json|*',
      "output": "./test/_data/output/transforms/counter_rename.json"
    }
  })) return 1;

  logger.info("=== add/remove counter");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*"
    },
    transforms: [
      {
        transform: "counter"
      },
      {
        transform: "mutate",
        default: {
          "counter": "=_count"
        }
      },
      {
        transform: "counter",
        remove: true
      }
    ],
    terminal: {
      "smt": 'json|./test/_data/output/transforms/|counter_remove.json|*',
      "output": "./test/_data/output/transforms/counter_remove.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
