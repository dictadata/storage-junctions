/**
 * test/json
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json");

async function tests() {

  logger.verbose('=== json_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|./test/output/|json_output.json|*"
    }
  });

  logger.verbose('=== json_o_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "jsono|./test/output/|json_o_output.json|*"
    }
  });

  logger.verbose('=== json_l_output.log');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "jsonl|./test/output/|json_l_output.log|*"
    }
  });

  logger.verbose('=== json_s_output.txt');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "jsons|./test/output/|json_s_output.txt|*"
    }
  });

  logger.verbose('=== json_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|./test/output/|json_output.json|*"
    }
  });

  logger.verbose('=== json_output.csv');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "csv|./test/output/|json_output.csv|*"
    }
  });

  logger.verbose('=== S3 subfolder/json_output.json.gz');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|S3:dictadata.org/subfolder/|json_output.json.gz|*"
    }
  });
  logger.verbose('S3:dictadata.org/subfolder/json_output.json.gz');

}

tests();
