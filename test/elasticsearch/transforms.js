/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: elasticsearch transforms");

async function tests() {

  logger.verbose('=== es_transform_1.json');
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      options: {
        match: {
          "Bar": "row",
          "Baz": { "lte": 500 }
        },
        cues: {
          fields: ["Dt Test", "Foo", "Bar", "Baz","subObj1"]
        }
      }
    },
    terminal: {
      smt: "json|./test/output/|es_transform_1.json|*"
    }
  });

  logger.verbose('=== es_transform_2.json');
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    terminal: {
      smt: "json|./test/output/|es_transform_2.json|*"
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
          "subObj1.state": "sub.state",
          "subObj2.subsub.izze": "sub.izze"
        },
        "remove": ["fobe"],
      }
    }
  });

}

tests();
