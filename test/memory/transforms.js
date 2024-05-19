/**
 * test/memory
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

async function tests() {

  logger.verbose('=== memory/transform_1.json');
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: [ "Dt Test", "Foo", "Bar", "Baz" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/memory/|transform_1.json|*",
      output: "./test/data/output/memory/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== memory/transform_2.json');
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema_01|*"
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
        "assign": {
          "fum": "here"
        },
        "map": {
          "foo": "=Foo",
          "bar": "=Bar",
          "baz": "=Baz",
          "fobe": "=Fobe",
          "tags": "=tags",
          "sub.state": "=subObj1.state",
          "sub.izze": "=subObj2.subsub.izze"
        },
        "remove": [ "fobe" ],
      }
    ],
    terminal: {
      smt: "json|./test/data/output/memory/|transform_2.json|*",
      output: "./test/data/output/memory/transform_2.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return 1;
};
