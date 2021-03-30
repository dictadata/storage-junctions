/**
 * test/transport
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("=== Tests: transport createSchema");

async function tests() {

  logger.info("=== transport createSchema foo_scheam");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  });

  // create schema for dullSchema.js
  logger.info("=== transport createSchema foo_schema_x");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_x|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  });

  logger.info("=== transport createSchema");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== transport createSchema");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  });

  logger.info("=== transport large fields");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_lg|*",
      options: {
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        },
        encoding: "./data/test/encoding_foo_lg.json"
      }
    }
  });

}

(async () => {
  await tests();
})();
