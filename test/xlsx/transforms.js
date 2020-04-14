/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx transforms");

async function tests() {

  logger.verbose('=== xlsx > xlsx_transform_1.json');
  await transfer({
    source: {
      smt: "xlsx|./test/data/foofile.xlsx|foo|*",
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
    destination: {
      smt: "json|./test/output/|xlsx_transform_1.json|*"
    }
  });

  logger.verbose('=== xlsx > xlsx_transform_2.json');
  await transfer({
    source: {
      smt: "xlsx|./test/data/foofile.xlsx|foo|*"
    },
    destination: {
      smt: "json|./test/output/|xlsx_transform_2.json|*"
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
