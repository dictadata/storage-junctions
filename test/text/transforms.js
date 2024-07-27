/**
 * test/json
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: txt transforms");

async function tests() {

  logger.verbose('=== txt > txt_transform_1.json');
  if (await transfer({
    origin: {
      smt: "text|./test/_data/input/|foofile.txt|*",
      options: {
        separator: "\t",
        quoted: "\"",
        hasHeader: true,
        raw: false
      },
      pattern: {
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        },
        fields: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    },
    terminal: {
      smt: "json|./test/_data/output/text/|transform_1.json|*",
      output: "./test/_data/output/text/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== txt > txt_transform_2.json');
  if (await transfer({
    origin: {
      smt: "txt|./test/_data/input/|foofile.txt|*",
      options: {
        hasHeader: true,
        separator: "\t",
        quoted: "\"",
        raw: false
      }
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        }
      },
      {
        transform: "mutate",
        select: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    ],
    terminal: {
      smt: "json|./test/_data/output/text/|transform_2.json|*",
      output: "./test/_data/output/text/transform_2.json"
    }
  })) return 1;

  logger.verbose('=== txt > txt_transform_3.json');
  if (await transfer({
    origin: {
      smt: "txt|./test/_data/input/|foofile.txt|*",
      options: {
        hasHeader: true,
        separator: "\t",
        quoted: "\"",
        raw: false
      }
    },
    transforms: [
      {
        transform: "filter",
        "match": {
          "Bar": /row.*/
        },
        "drop": {
          "Baz": { "gt": 500 }
        }
      },
      {
        transform: "mutate",
        "default": {
          "fie": "where's fum?"
        },
        "assign": {
          "fum": "here"
        },
        "map": {
          "dt_test": "=Dt Test",
          "foo": "=Foo",
          "bar": "=Bar",
          "baz": "=Baz",
          "fobe": "=Fobe"
        },
        "remove": [ "fobe" ],
      }
    ],
    terminal: {
      smt: "json|./test/_data/output/text/|transform_3.json|*",
      output: "./test/_data/output/text/transform_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
