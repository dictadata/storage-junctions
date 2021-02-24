/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx transforms");

async function tests() {

  logger.verbose('=== xlsx > xlsx_transform_1.json');
  await transfer({
    origin: {
      smt: "xlsx|./test/data/foofile.xlsx|foo|*",
      options: {
        match: {
          "Bar": { "wc": "row*" }
        },
        fields: ["Foo", "Bar", "Baz", "Dt Test"]
      }
    },
    terminal: {
      smt: "json|./output/xlsx/|transform_1.json|*"
    }
  });

  logger.verbose('=== xlsx > xlsx_transform_2.json');
  await transfer({
    origin: {
      smt: "xlsx|./test/data/foofile.xlsx|foo|*"
    },
    transforms: {
      "filter": {
        "match": {
          "Bar": "row"
        },
        "drop": {
          "Baz": { "gt": 500 }
        }
      },
      "select": {
        "inject_before": {
          "fie": "where's fum?"
        },
        "inject_after": {
          "fum": "here"
        },
        "fields": {
          "Dt Test": "dt_date",
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./output/xlsx/|transform_2.json|*"
    }
  });

}

(async () => {
  await tests();
})();
