/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require("@dictadata/lib");

logger.info("=== Test: elasticsearch transforms");

async function tests() {

  logger.verbose('=== elasticsearch_transform_1.json');
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: [ "Dt Test", "Foo", "Bar", "Baz" ],
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      smt: "json|./test/data/output/elasticsearch/|transform_1.json|*",
      output: "./test/data/output/elasticsearch/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== elasticsearch_transform_2.json');
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_01|*"
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
      smt: "json|./test/data/output/elasticsearch/|transform_2.json|*",
      output: "./test/data/output/elasticsearch/transform_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
