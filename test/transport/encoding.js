/**
 * test/transport
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: transport");

async function tests() {

  logger.info("=== transport createSchema");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
    }
  });

  logger.info("=== transport get encoding");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*"
    },
    terminal: {
      output: './output/transport/encoding_foo.json'
    }
  });

  logger.info("=== transport createSchema");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== transport get encoding");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './output/transport/encoding_foo_01.json'
    }
  });

  logger.info("=== transport createSchema");
  await createSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  });

  logger.info("=== transport get encoding");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './output/transport/encoding_foo_02.json'
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
        encoding: "./test/data/encoding_foo_lg.json"
      }
    }
  });

}

(async () => {
  await tests();
})();
