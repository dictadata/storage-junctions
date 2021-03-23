/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: mysql transforms");

async function tests() {

  logger.verbose("=== json => mysql foo_schema_etl2");
  await transfer({
    "origin": {
      "smt": "json|./test/data/|foofile.json|*"
    },
    "transforms": {
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
      "smt": "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_etl2|*",
      "options": {
        "encoding": "./test/data/foo_encoding_t.json"
      }
    }
  });

  logger.verbose('=== mysql > mysql_transform_0.json');
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      options: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: ["Dt Test", "Foo", "Bar", "Baz"]
      }
    },
    terminal: {
      smt: "json|./output/mysql/|transform_0.json|*"
    }
  });

  logger.verbose('=== mysql > mysql_transform_1.json');
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
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
          "Fobe": "fobe",
          "subObj1": "subObj1"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./output/mysql/|transform_1.json|*"
    }
  });

  logger.verbose('=== mysql > mysql_transform_2.json');
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
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
          "Fobe": "fobe",
          "tags": "tags"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./output/mysql/|transform_2.json|*"
    }
  });

}

(async () => {
  await tests();
})();
