/**
 * test/oracledb list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../storage/logger');

logger.info("=== tests: oracledb list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/oracledb/list.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
