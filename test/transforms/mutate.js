/**
 * test/json
 */
"use strict";

const transfer = require('../_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: transforms mutate");

async function tests() {

  logger.verbose('=== mutate_1.json');
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
          "Baz": "let x = (construct.Baz * 100); return x;"
        },
        assign: {
          "bar_b": "=Bar/.*(boat)/$1"
        }
      }
    ],
    terminal: {
      smt: "json|./test/data/output/transforms/|mutate_1.json|*",
      output: "./test/data/output/transforms/mutate_1.json"
    }
  })) return 1;

  logger.verbose('=== mutate_2.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/transforms/|mutate_2.json|*",
      output: "./test/data/output/transforms/mutate_2.json"
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
          "fobe": "=Fobe",
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

  logger.verbose('=== mutate_3.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|file_list.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/transforms/|mutate_3.json|*",
      output: "./test/data/output/transforms/mutate_3.json"
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


  logger.verbose('=== mutate_4.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    transforms: [
      {
        transform: "mutate",
        select: [ "Foo", "Bar", "Baz", "Dt Test" ],
        func: {
          "Baz": "return (construct.Baz * 100);"
        }
      }
    ],
    terminal: {
      smt: "json|./test/data/output/transforms/|mutate_4.json|*",
      output: "./test/data/output/transforms/mutate_4.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
