/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json transfers");

async function tests() {

  logger.verbose('=== json_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "json|./output/|json_output.json|*"
    }
  });

  logger.verbose('=== json_output.csv');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "csv|./output/|json_output.csv|*",
      options: {
        csvHeader: true
      }
    }
  });

  logger.verbose('=== json_output_o.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "jsono|./output/|json_output_o.json|*"
    }
  });

  logger.verbose('=== json_output_l.log');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "jsonl|./output/|json_output_l.log|*"
    }
  });

  logger.verbose('=== json_output_s.txt');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "jsons|./output/|json_output_s.txt|*"
    }
  });

}

(async () => {
  await tests();
})();
