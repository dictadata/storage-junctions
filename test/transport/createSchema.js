/**
 * test/transport
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: transport createSchema");

async function tests() {

  logger.info("=== transport createSchema foo_schema");
  if (await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
    }
  })) return 1;

  // create schema for dullSchema.js
  logger.info("=== transport createSchema foo_schema_x");
  if (await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_x|*",
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
    }
  })) return 1;

  logger.info("=== transport createSchema");
  if (await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== transport createSchema");
  if (await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== transport large fields");
  if (await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_lg|*",
      options: {
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        },
        encoding: "./test/data/encoding_foo_lg.json"
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
