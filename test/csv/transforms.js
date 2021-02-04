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
        csvHeader: true,
        match: {
          "Bar": { "wc": "row*" }
        },
        fields: ["Foo", "Bar", "Baz", "Dt Test"]
      }
    },
    terminal: {
      smt: "json|./output/|csv_transform_1.json|*"
    }
  });

  logger.verbose('=== csv > csv_transform_2.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "json|./output/|csv_transform_2.json|*"
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

  logger.verbose('=== csv > csv_transform_3.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "json|./output/|csv_transform_3.json|*"
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
