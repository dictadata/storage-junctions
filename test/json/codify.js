/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: json codify");

async function tests() {

  logger.info("=== codify foofile.engram.json");
  if (await codify({
    name: "foofile",
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    terminal: {
      output: './test/data/output/json/codify_1.json'
    }
  })) return 1;

  logger.info("=== codify foofile.engram.json.gz");
  if (await codify({
    origin: {
      smt: "json|./test/data/input/|foofile.json.gz|*"
    },
    terminal: {
      output: './test/data/output/json/codify_g1.json'
    }
  })) return 1;

  logger.info("=== codify foofile_01.engram.json");
  if (await codify({
    origin: {
      smt: "json|./test/data/input/|foofile_01.json|*"
    },
    terminal: {
      output: './test/data/output/json/codify_m1.json'
    }
  })) return 1;

  logger.info("=== codify foo_widgets.engram.json");
  if (await codify({
    origin: {
      smt: "json|./test/data/input/|foo_widgets.json|*"
    },
    terminal: {
      output: './test/data/output/json/codify_l1.json'
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
