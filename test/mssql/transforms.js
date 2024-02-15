/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql transforms");

async function tests() {

  logger.verbose("=== json => mssql foo_schema_etl2");
  if (await transfer({
    "origin": {
      "smt": "json|./test/data/input/|foofile_01.json|*"
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
      "smt": "mssql|server=dev.dictadata.net;database=storage_node|foo_schema_etl2|*",
      "options": {
        "encoding": "./test/data/input/encodings/foo_schema_t.encoding.json"
      }
    }
  })) return 1;

  logger.verbose('=== mssql > mssql_transform_0.json');
  if (await transfer({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: [ "Dt Test", "Foo", "Bar", "Baz" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/mssql/|transform_0.json|*",
      output: "./test/data/output/mssql/transform_0.json"
    }
  })) return 1;

  logger.verbose('=== mssql > mssql_transform_1.json');
  if (await transfer({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/input/encodings/foo_schema_01.encoding.json"
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
      smt: "json|./test/data/output/mssql/|transform_1.json|*",
      output: "./test/data/output/mssql/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== mssql > mssql_transform_2.json');
  if (await transfer({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_widgets|*",
      options: {
        encoding: "./test/data/input/encodings/foo_widgets.encoding.json"
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
      smt: "json|./test/data/output/mssql/|transform_2.json|*",
      output: "./test/data/output/mssql/transform_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
