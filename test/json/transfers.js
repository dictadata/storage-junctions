/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const transform = require('../lib/_transform');
const logger = require('../../lib/logger');

logger.info("=== Test: json transfers");

async function tests() {

  logger.verbose('=== json_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "json|./test/output/|json_output.json|*"
    }
  });

  logger.verbose('=== json_output_o.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "jsono|./test/output/|json_output_o.json|*"
    }
  });

  logger.verbose('=== json_output_l.log');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "jsonl|./test/output/|json_output_l.log|*"
    }
  });

  logger.verbose('=== json_output_s.txt');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "jsons|./test/output/|json_output_s.txt|*"
    }
  });

  logger.verbose('=== json_output.csv');
  await transform({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "csv|./test/output/|json_output.csv|*"
    },
    transform: {
      mapping: {
        "Foo": "foo",
        "Bar": "bar",
        "Baz": "baz",
        "Fobe": "fobe",
        "Dt Test": "dt_test",
        "enabled": "enabled",
        "subObj1.state": "state",
        "subObj2.subsub.izze": "izze"
      }
    }
  });

}

tests();
