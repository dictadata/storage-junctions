/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: elasticsearch transforms");

async function tests() {

  logger.verbose('=== elasticsearch_transform_1.json');
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      options: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        fields: ["Dt Test", "Foo", "Bar", "Baz"]
      }
    },
    terminal: {
      smt: "json|./data/output/elasticsearch/|transform_1.json|*"
    }
  });

  logger.verbose('=== elasticsearch_transform_2.json');
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_01|*"
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
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "tags": "tags",
          "subObj1.state": "sub.state",
          "subObj2.subsub.izze": "sub.izze"
        },
        "remove": ["fobe"],
      }
    },
    terminal: {
      smt: "json|./data/output/elasticsearch/|transform_2.json|*"
    }
  });

}

(async () => {
  await tests();
})();
