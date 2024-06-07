/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('@dictadata/storage-lib');

logger.info("=== Test: csv transforms");

async function tests() {

  logger.verbose('=== csv > csv_transform_none.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true,
        encoding: "./test/data/input/engrams/foo_schema.engram.json"
      },
      pattern: {
        match: {
          "Foo": "none"
        }
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|transform_none.csv|*",
      options: {
        header: true
      },
      output: "./test/data/output/csv/transform_none.csv"
    }
  })) return 1;

  logger.verbose('=== csv > csv_transform_1.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
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
      smt: "json|./test/data/output/csv/|transform_3.json|*",
      output: "./test/data/output/csv/transform_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
