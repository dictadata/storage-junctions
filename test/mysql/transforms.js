/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql transforms");

async function tests() {

  logger.verbose('=== mysql > mysql_transform_1.json');
  await transfer({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
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
      smt: "json|./test/output/|mysql_transform_1.json|*"
    }
  });

  logger.verbose('=== mysql > mysql_transform_2.json');
  await transfer({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    },
    destination: {
      smt: "json|./test/output/|mysql_transform_2.json|*"
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
