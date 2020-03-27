/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== csv_transform.json');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "json|./test/output/|csv_transform.json|*"
    },
    transforms: {
      filter: {
        "match": {
          "Bar": { "eq": "row"}
        }
      },
      fields: {
        mapping: {
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "Dt Test": "dt_test",
          "enabled": "enabled"
        }
      }
    }
  });

}

tests();
