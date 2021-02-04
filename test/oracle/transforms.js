/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle transforms");

async function tests() {

  logger.verbose('=== oracle > oracle_transform_0.json');
  await transfer({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      options: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: ["Dt Test", "Foo", "Bar", "Baz"]
      }
    },
    terminal: {
      smt: "json|./output/|oracle_transform_0.json|*"
    }
  });

  logger.verbose('=== oracle > oracle_transform_1.json');
  await transfer({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*",
      encoding: "./test/data/encoding_foo_01.json",
    },
    terminal: {
      smt: "json|./output/|oracle_transform_1.json|*"
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
    }
  });

  logger.verbose('=== oracle > oracle_transform_2.json');
  await transfer({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*",
      encoding: "./test/data/encoding_foo_02.json",
    },
    terminal: {
      smt: "json|./output/|oracle_transform_2.json|*"
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
    }
  });

}

tests();
