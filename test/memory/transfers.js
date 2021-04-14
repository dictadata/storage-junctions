/**
 * test/memory
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: memory");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "memory|testgroup|foo_transfer|*"
  })) return 1;

  logger.info("=== csv => memory");
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "memory|testgroup|foo_schema|*"
    }
  })) return 1;

  logger.info("=== json => memory");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile.json|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_schema_j|*"
    }
  })) return 1;

  logger.info("=== json 01 => memory");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile_01.json|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_schema_01|*"
    }
  })) return 1;

  logger.info("=== json 02 => memory");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile_02.json|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_schema_02|*"
    }
  })) return 1;

  logger.info("=== memory => memory");
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema|*"
    },
    terminal: {
      smt: "memory|testgroup|foo_transfer|*"
    }
  })) return 1;

  logger.info("=== memory => csv");
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./data/output/memory/|transfer_foo.csv|*",
      options: {
        header: true,
        append: false
      }
    }
  })) return 1;

  logger.info("=== memory => json");
  if (await transfer({
    origin: {
      smt: "memory|testgroup|foo_schema_j|*"
    },
    terminal: {
      smt: "json|./data/output/memory/|transfer_foo_j.json|*",
      options: {
        append: false
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
