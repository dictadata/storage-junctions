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
    terminus: {
      smt: "json|./test/output/|json_output.json|*"
    }
  });

  logger.verbose('=== json_output.csv');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "csv|./test/output/|json_output.csv|*"
    }
  });

  logger.verbose('=== json_output_o.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "jsono|./test/output/|json_output_o.json|*"
    }
  });

  logger.verbose('=== json_output_l.log');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "jsonl|./test/output/|json_output_l.log|*"
    }
  });

  logger.verbose('=== json_output_s.txt');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "jsons|./test/output/|json_output_s.txt|*"
    }
  });

}

tests();
