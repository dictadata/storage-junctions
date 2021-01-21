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
    origin: {
      smt: "json|./test/data/|foofile_01.json|*",
      options: {
        match: {
          "Bar": { "wc": "row*" }
        },
        fields: ["Foo", "Bar", "Baz", "Dt Test","subObj1"]
      }
    },
    terminal: {
      smt: "json|./test/output/|json_transform_1.json|*"
    }
  });

  logger.verbose('=== json_transform_2.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*"
    },
    terminal: {
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

  logger.verbose('=== json > json_transform_3.csv');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*"
    },
    terminal: {
      smt: "csv|./test/output/|json_transform_3.csv|*",
      options: {
        csvHeader: true
      }
    },
    transforms: {
      filter: {
        match: {
          "Bar": /row/,
          "Baz": [456,789]
        },
        select: {
          fields: ["Foo","Bar","Baz","Fobe","Dt Test","enabled"]
        }
      }
    }
  });

}

tests();
