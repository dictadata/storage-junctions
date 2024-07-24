/**
 * test/txt
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: text data transfers");

async function tests() {


  logger.verbose('=== foofile.csv');
  if (await transfer({
    origin: {
      smt: "text|./test/_data/input/|foofile.csv|*",
      options: {
        header: true,
        separator: ",",
        quoted: "\""
      }
    },
    terminal: {
      smt: "json|./test/_data/output/text/|transfer_csv.json|*",
      output: "./test/_data/output/text/transfer_csv.json"
    }
  })) return 1;

  logger.verbose('=== foofile.txt');
  if (await transfer({
    origin: {
      smt: "txt|./test/_data/input/|foofile.txt|*",
      options: {
        header: true,
        separator: "\t",
        quoted: "\""
      }
    },
    terminal: {
      smt: "json|./test/_data/output/text/|transfer_txt.json|*",
      output: "./test/_data/output/text/transfer_txt.json"
    }
  })) return 1;

  logger.verbose('=== foo_data.txt');
  if (await transfer({
    origin: {
      smt: "txt|./test/_data/input/|foo_data.txt|*",
      options: {
        header: true,
        separator: "\t",
        quoted: "\""
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/text/|transfer_data.csv|*",
      options: {
        header: true
      },
      output: "./test/_data/output/text/transfer_data.csv"
    }
  })) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
