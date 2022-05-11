/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== json_transform_1.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      pattern: {
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        },
        fields: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/json/|transform_1.json|*",
      output: "./test/data/output/json/transform_1.json"
    }
  })) return 1;

  logger.verbose('=== json > json_transform_2.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    transform: {
      filter: {
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        }
      },
      select: {
        fields: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    },
    terminal: {
      smt: "json|./test/data/output/json/|transform_2.json|*",
      output: "./test/data/output/json/transform_2.json"
    }
  })) return 1;

  logger.verbose('=== json_transform_3.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/json/|transform_3.json|*",
      output: "./test/data/output/json/transform_3.json"
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
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "subObj1.state": "sub.state",
          "subObj2.subsub.izze": "sub.izze"
        },
        "remove": [ "fobe" ],
      }
    }
  })) return 1;

  logger.verbose('=== json_transform_4.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/json/|transform_4.json|*",
      output: "./test/data/output/json/transform_4.json"
    },
    transform: {
      filter: {
        match: {
          "subObj2.subsub.izze": 33
        },
        fields: [ "Foo", "Bar", "Baz", "Dt Test", "tags", "subObj2" ]
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
