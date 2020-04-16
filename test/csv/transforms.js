/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: csv transforms");

async function tests() {

  logger.verbose('=== csv > csv_transform_1.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        reader: {
          match: {
            "Bar": "row",
            "Baz": { "lte": 500 }
          },
          cues: {
            fields: ["Dt Test", "Foo", "Bar", "Baz"]
          }
        }
      }
    },
    terminal: {
      smt: "json|./test/output/|csv_transform_1.json|*"
    }
  });

  logger.verbose('=== csv > csv_transform_2.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminal: {
      smt: "json|./test/output/|csv_transform_2.json|*"
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
    }
  });

}

tests();
