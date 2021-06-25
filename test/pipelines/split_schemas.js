/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: split file");

async function tests() {

  logger.verbose('=== table_schemas => ./test/data/output/split_*_encoding');
  if (await transfer({
    "origin": {
      "smt": "json|./test/data/input/|table_schemas.json|*"
    },
    "terminal": {
      "smt": "split|*|*|*",
      "options": {
        "splitOn": "TABLE_NAME",
        "tract": {
          "transform": {
            "encoder": {
              "junction": "OracleDBJunction"
            }
          },
          "terminal": {
            "smt": "jsono|./test/data/output/pipelines/|split_*_encoding.json|=name",
            "options": {
              "formation": {
                "opening": '{\n"fields": {\n  ',
                "delimiter": ',\n  ',
                "closing": "\n}\n}"
              }
            }
          }
        }
      }
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
