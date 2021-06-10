/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== json_transform_1.json');
  let smt1 = "json|./data/output/json/|transform_1.json|*";

  await transfer({
    origin: {
      smt: "json|./data/test/|foofile_01.json|*",
      options: {
        match: {
          "Bar": { "wc": "row*" }
        },
        fields: ["Foo", "Bar", "Baz", "Dt Test","tags","subObj1"]
      }
    },
    terminal: {
      smt: smt1
    }
  });

  logger.verbose('=== json_transform_2.json');
  let smt2 = "json|./data/output/json/|transform_2.json|*";

  await transfer({
    origin: {
      smt: "json|./data/test/|foofile_01.json|*"
    },
    transform: {
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
    },
    terminal: {
      smt: smt2
    }
  });

  logger.verbose('=== json > json_transform_3.csv');
  let smt3 = "csv|./data/output/json/|transform_3.csv|*";

  await transfer({
    origin: {
      smt: "json|./data/test/|foofile_02.json|*"
    },
    transform: {
      filter: {
        match: {
          "Bar": /row/,
          "Baz": [456, 789]
        }
      },
      select: {
        fields: ["Foo","Bar","Baz","Fobe","Dt Test","enabled"]
      }
    },
    terminal: {
      smt: smt3,
      options: {
        header: true
      }
    }
  });

}

(async () => {
  await tests();
})();
