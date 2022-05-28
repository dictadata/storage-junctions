/**
 * test/memory
 */
"use strict";

const transfer = require('../lib/_transfer');

const { logger } = require('../../storage/utils');

async function tests() {

  logger.info("=== csv => memory");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "memory|testgroup|foo_schema|!Foo"
    }
  })) return 1;

  logger.info("=== json => memory");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_schema_j|!Foo"
    }
  })) return 1;

  logger.info("=== json 01 => memory");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_schema_01|!Foo"
    }
  })) return 1;

  logger.info("=== json 02 => memory");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_02.json|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_schema_02|!Foo"
    }
  })) return 1;

  logger.info("=== memory => memory");
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    terminal: {
      smt: "memory|testgroup|foo_transfer|!Foo"
    }
  })) return 1;

  logger.info("=== memory => csv");
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_transfer|!Foo"
    },
    terminal: {
      smt: "csv|./data/output/memory/|transfer_foo.csv|*",
      options: {
        header: true,
        append: false
      },
      output: "./data/output/memory/transfer_foo.csv"
    }
  })) return 1;

  logger.info("=== memory => json");
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema_j|!Foo"
    },
    terminal: {
      smt: "json|./data/output/memory/|transfer_foo_j.json|*",
      options: {
        append: false
      },
      output: "./data/output/memory/transfer_foo_j.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return 1;
};
