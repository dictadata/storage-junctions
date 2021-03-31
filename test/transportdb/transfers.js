/**
 * test/transportdb
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: transportdb transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_transfer|*"
  })) return 1;

  logger.info("=== foofile.csv > transportdb.foo_schema");
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo"
    }
  })) return 1;

  logger.info("=== foofile_01.json > transportdb");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile_01.json|*" 
    },
    terminal: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_02.json > transportdb");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile_02.json|*" 
    },
    terminal: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_02|=Foo",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== transportdb.foo_schema > transportdb.foo_transfer");
  if (await transfer({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|*"
    },
    terminal: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_transfer|*"
    }
  })) return 1;

  logger.info("=== transportdb.foo_transfer > oracle_transfer.csv");
  if (await transfer({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./data/output/transportdb/|transfer.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
