/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== json_adjoin_1.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      options: {
        "encoding": "./test/data/input/engrams/foo_schema.engram.json"
      }
    },
    transforms: [
      {
        transform: "adjoin",
        smt: "json|./test/data/input/|foofile_01.json|*",
        lookup: {
          "Foo": "=Foo"
        },
        inject: [ "tags" ]
      }
    ],
    terminal: {
      smt: "json|./test/data/output/transforms/|adjoin_1.json|*",
      options: {
        "encoding": "./test/data/input/engrams/foo_schema_01.engram.json"
      },
      output: "./test/data/output/transforms/adjoin_1.json"
    }
  })) return 1;


  logger.verbose('=== json_adjoin_2.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      options: {
        "encoding": "./test/data/input/engrams/foo_schema.engram.json"
      }
    },
    transforms: [
      {
        transform: "adjoin",
        smt: "json|./test/data/input/|foo_widgets.json|*",
        options: {},
        pattern: {},
        lookup: {
          "Baz": "=Baz",
          "Foo": "=Foo"
        },
        inject: [ "tags", "widgets" ]
      }
    ],
    terminal: {
      smt: "json|./test/data/output/transforms/|adjoin_2.json|*",
      options: {
        "encoding": "./test/data/input/engrams/foo_widgets.engram.json"
      },
      output: "./test/data/output/transforms/adjoin_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
