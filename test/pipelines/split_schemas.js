/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: split file");

async function tests() {

  logger.verbose('=== table_schemas => ./data/output/split_*_encoding');
  await transfer({
    "origin": {
      "smt": "json|./data/test/|table_schemas.json|*"
    },
    "terminal": {
      "smt": "split|*|*|*",
      "options": {
        "splitOn": "TABLE_NAME",
        "tract": {
          "transforms": {
            "encoder": {
              "junction": "OracleDBJunction"
            }
          },
          "terminal": {
            "smt": "jsono|./data/output/pipelines|split_*_encoding.json|=name",
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
  });
}

(async () => {
  await tests();
})();
