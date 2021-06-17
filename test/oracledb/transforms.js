/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: oracledb transforms");

async function tests() {

  logger.verbose('=== json > oracledb foo_schema_etl2');
  if (await transfer({
    "origin": {
      "smt": "json|./test/data/|foofile.json|*"
    },
    "transform": {
      "filter": {
        "match": {
          "Bar": "row"
        },
        "drop": {
          "Baz": {
            "eq": 456
          }
        }
      },
      "select": {
        "fields": {
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "Dt Test": "dt_test",
          "subObj1.state": "state"
        },
        "inject_after": {
          "fie": "where's fum?"
        },
        "remove": ["fobe"]
      }
    },
    "terminal": {
      "smt": "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_etl2|*",
      "options": {
        "encoding": "./test/data/foo_encoding_t.json"
      }
    }
  })) return 1;

  logger.verbose('=== oracledb > oracle_transform_0.json');
  if (await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      options: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: ["Dt Test", "Foo", "Bar", "Baz"]
      }
    },
    terminal: {
      smt: "json|./test/data/output/oracledb/|transform_0.json|*"
    }
  })) return 1;

  logger.verbose('=== oracledb > oracle_transform_1.json');
  if (await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
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
          "Dt Test": "dt_date",
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "subObj1": "subObj1"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./test/data/output/oracledb/|transform_1.json|*"
    }
  })) return 1;

  logger.verbose('=== oracledb > oracle_transform_2.json');
  if (await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
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
          "Dt Test": "dt_date",
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "tags": "tags"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./test/data/output/oracledb/|transform_2.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
