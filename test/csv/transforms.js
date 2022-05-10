/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: csv transforms");

async function tests() {

  logger.verbose('=== csv > csv_transform_1.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true,
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        },
        fields: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/csv/|transform_1.json|*",
      output: "./test/data/output/csv/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== csv > csv_transform_2.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    transform: {
      filter: {
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        }
      },
      select: {
        fields: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/csv/|transform_2.json|*",
      output: "./test/data/output/csv/transform_2.json"
    }
  })) return 1;

  logger.verbose('=== csv > csv_transform_3.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    transform: {
      "filter": {
        "match": {
          "Bar": /row.*/
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
        "remove": [ "fobe" ],
      }
    },
    terminal: {
      smt: "json|./test/data/output/csv/|transform_3.json|*",
      output: "./test/data/output/csv/transform_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
