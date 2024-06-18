/**
 * test/json
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: json template data transfers");

async function tests() {

  logger.verbose('=== template_1.json');
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*"
    },
    terminal: {
      smt: "template|./test/_data/output/template/|transfer_1.json|*",
      options: {
        template: "./test/_data/input/template_1.json",
        params: {
          name: "transfer_1"
        },
        storeTo: "data"
      },
      output: "./test/_data/output/template/transfer_1.json"
    }
  })) return 1;

}


(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
