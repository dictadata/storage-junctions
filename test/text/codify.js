/**
 * test/codify
 */
"use strict";

const codify = require('../_lib/_codify');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: text codify");

async function tests() {

  logger.verbose("=== text > codify");
  if (await codify({
    origin: {
      smt: "txt|./test/_data/input/|foofile.txt|*",
      options: {
        header: true,
        separator: "\t",
        quoted: "\""
      }
    },
    terminal: {
      output: './test/_data/output/text/codify_foo.json'
    }
  })) return 1;

  logger.verbose("=== text > codify");
  if (await codify({
    origin: {
      smt: "txt|./test/_data/input/|foo_data.txt|*",
      options: {
        header: true,
        separator: "\t",
        quoted: "\""
      }
    },
    terminal: {
      output: './test/_data/output/text/codify_data.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return 1;
})();
