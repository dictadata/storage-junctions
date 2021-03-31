/**
 * test/transportdb
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("=== Tests: transportdb createSchema");

async function tests() {

  logger.info("=== transportdb createSchema foo_scheam");
  if (await createSchema({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  })) return 1;

  // create schema for dullSchema.js
  logger.info("=== transportdb createSchema foo_schema_x");
  if (await createSchema({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_x|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  })) return 1;

  logger.info("=== transportdb createSchema");
  if (await createSchema({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_01|*",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== transportdb createSchema");
  if (await createSchema({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_02|*",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== transportdb large fields");
  if (await createSchema({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_lg|*",
      options: {
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        },
        encoding: "./data/test/encoding_foo_lg.json"
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
