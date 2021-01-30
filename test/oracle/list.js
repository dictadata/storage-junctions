/**
 * test/oracle list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: oracle list");

async function tests() {

  logger.info("=== list");
  await list({
    origin: {
      smt: "oracle|connectString=localhost/XE;user=dicta;password=data|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/output/oracle_list.json"
    }
  });

}

tests();
