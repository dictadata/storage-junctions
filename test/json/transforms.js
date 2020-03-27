/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== json_transform.csv');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "csv|./test/output/|json_transform.csv|*"
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
          "enabled": "enabled",
          "subObj1.state": "state",
          "subObj2.subsub.izze": "izze"
        }
      }
    }
  });

}

tests();
