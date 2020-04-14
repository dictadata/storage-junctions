/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== json_transform_1.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*",
      options: {
        reader: {
          match: {
            "Bar": "row",
            "Baz": { "lte": 500 }
          },
          cues: {
            fields: ["Dt Test", "Foo", "Bar", "Baz","subObj1"]
          }
        }
      }
    },
    destination: {
      smt: "json|./test/output/|json_transform_1.json|*"
    }
  });

  logger.verbose('=== json_transform_2.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "json|./test/output/|json_transform_2.json|*"
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
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "subObj1.state": "sub.state",
          "subObj2.subsub.izze": "sub.izze"
        },
        "remove": ["fobe"],
      }
    }
  });

}

tests();
