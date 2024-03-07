/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: json template data transfers");

async function tests() {

  logger.verbose('=== template_1.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    terminal: {
      smt: "template|./test/data/output/template/|transfer_1.json|*",
      options: {
        template: "./test/data/input/template_1.json",
        params: {
          name: "transfer_1"
        },
        storeTo: "data"
      },
      output: "./test/data/output/template/transfer_1.json"
    }
  })) return 1;

}


(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
