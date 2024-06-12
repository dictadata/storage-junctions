/**
 * test/json
 */
"use strict";

const transfer = require('../_transfer');
const { logger } = require('@dictadata/lib');

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
    transforms: [
      {
        transform: "filter",
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        }
      },
      {
        transform: "mutate",
        select: [ "Foo", "Bar", "Baz", "Dt Test" ],
        func: {
          "Baz": "return (construct.Baz * 100);"
        }
      }
    ],
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
        "map": {
          "foo": "=Foo",
          "bar": "=Bar",
          "baz": "=Baz",
          "fobe": "=Fobe",
          "tags": "=tags",
          "sub.state": "=subObj1.state",
          "sub.izze": "=subObj2.subsub.izze"
        },
        "assign": {
          "fum": "here"
        },
        "func": {
          "fobe": "return (construct.Fobe * 100);"
        },
        "remove": [ "baz" ]
      }
    ]
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
    transforms: [
      {
        transform: "filter",
        match: {
          "subObj2.subsub.izze": 33
        },
        fields: [ "Foo", "Bar", "Baz", "Dt Test", "tags", "subObj2" ]
      }
    ]
  })) return 1;

  logger.verbose('=== json_transform_5.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|file_list.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/json/|transform_5.json|*",
      output: "./test/data/output/json/transform_5.json"
    },
    transforms: [
      {
        transform: "mutate",
        select: [
          "rpath",
          "name",
          "size",
          "date"
        ]
      }
    ]
  })) return 1;

  logger.verbose('=== json > json_transform_none.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      pattern: {
        match: {
          "Foo": "none"
        }
      }
    },
    terminal: {
      smt: "json|./test/data/output/json/|transform_none.json|*",
      output: "./test/data/output/json/transform_none.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
