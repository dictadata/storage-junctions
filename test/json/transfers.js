/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: json data transfers");

async function tests() {

  logger.verbose('=== transfer_1.json');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "json|./data/output/json/|transfer_1.json|*",
      output: "./data/output/json/transfer_1.json"
    }
  })) return 1;

  logger.verbose('=== transfer_badfile.json');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_badfile.json|*"
    },
    terminal: {
      smt: "json|./data/output/json/|transfer_badfile.json|*",
      output: "./data/output/json/transfer_badfile.json"
    }
  }, -1)) return 1;

  logger.verbose('=== transfer_2.csv');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "csv|./data/output/json/|transfer_2.csv|*",
      options: {
        header: true
      },
      output: "./data/output/json/transfer_2.csv"
    }
  })) return 1;

  logger.verbose('=== json_output_o.json');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "jsono|./data/output/json/|transfer_o.json|*",
      output: "./data/output/json/transfer_o.json"
    }
  })) return 1;

  logger.verbose('=== json_output_l.txt');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "jsonl|./data/output/json/|transfer_l.txt|*",
      output: "./data/output/json/transfer_l.txt"
    }
  })) return 1;

  logger.verbose('=== json_output_s.txt');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "jsons|./data/output/json/|transfer_s.txt|*",
      output: "./data/output/json/transfer_s.txt"
    }
  })) return 1;

  logger.verbose('=== transfer_dataPath.json');
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*",
      options: {
        dataPath: "/var/data/dictadata.net/"
      }
    },
    terminal: {
      smt: "json|./data/output/json/|transfer_dataPath.json|*",
      output: "./data/output/json/transfer_dataPath.json"
    }
  })) return 1;

}


(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
