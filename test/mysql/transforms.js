/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mysql transforms");

async function tests() {

  logger.verbose("=== json => mysql foo_schema_etl2");
  if (await transfer({
    "origin": {
      "smt": "json|./test/data/input/|foofile.json|*"
    },
    "transforms": [
      {
        "transform": "filter",
        "match": {
          "Bar": "row"
        },
        "drop": {
          "Baz": {
            "eq": 456
          }
        }
      },
      {
        "transform": "mutate",
        "map": {
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "Dt Test": "dt_test",
          "subObj1.state": "state"
        },
        "override": {
          "fie": "where's fum?"
        },
        "remove": [ "fobe" ]
      }
    ],
    "terminal": {
      "smt": "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_etl2|*",
      "options": {
        "encoding": "./test/data/input/engrams/foo_schema_t.engram.json"
      }
    }
  })) return 1;

  logger.verbose('=== mysql > mysql_transform_0.json');
  if (await transfer({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: [ "Dt Test", "Foo", "Bar", "Baz" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/mysql/|transform_0.json|*",
      output: "./test/data/output/mysql/transform_0.json"
    }
  })) return 1;

  logger.verbose('=== mysql > mysql_transform_1.json');
  if (await transfer({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/input/engrams/foo_schema_01.engram.json"
      }
    },
    transforms: [
      {
        transform: "filter",
        "match": {
          "Bar": "row"
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
        "override": {
          "fum": "here"
        },
        "map": {
          "Dt Test": "dt_date",
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "subObj1": "subObj1"
        },
        "remove": [ "fobe" ],
      }
    ],
    terminal: {
      smt: "json|./test/data/output/mysql/|transform_1.json|*",
      output: "./test/data/output/mysql/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== mysql > mysql_transform_2.json');
  if (await transfer({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_widgets|*",
      options: {
        encoding: "./test/data/input/engrams/foo_widgets.engram.json"
      }
    },
    transforms: [
      {
        transform: "filter",
        "match": {
          "Bar": "row"
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
        "override": {
          "fum": "here"
        },
        "map": {
          "Dt Test": "dt_date",
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "tags": "tags"
        },
        "remove": [ "fobe" ],
      }
    ],
    terminal: {
      smt: "json|./test/data/output/mysql/|transform_2.json|*",
      output: "./test/data/output/mysql/transform_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
