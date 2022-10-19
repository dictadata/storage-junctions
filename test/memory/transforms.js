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
      smt: "json|./data/output/memory/|transform_1.json|*",
      output: "./data/output/memory/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== memory/transform_2.json');
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema_01|*"
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
      "mutate": {
        "default": {
          "fie": "where's fum?"
        },
        "override": {
          "fum": "here"
        },
        "map": {
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "tags": "tags",
          "subObj1.state": "sub.state",
          "subObj2.subsub.izze": "sub.izze"
        },
        "remove": [ "fobe" ],
      }
    },
    terminal: {
      smt: "json|./data/output/memory/|transform_2.json|*",
      output: "./data/output/memory/transform_2.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return 1;
};
