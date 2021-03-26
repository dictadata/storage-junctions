/**
 * test/transport
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: transport transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  await dullSchema({
    smt: "transport|http://localhost:8089/transport/storage_node|foo_transfer|*"
  });

  logger.info("=== foofile.csv > transport.foo_schema");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|=Foo"
    }
  });

  logger.info("=== foofile_01.json > transport");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*" 
    },
    terminal: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== foofile_02.json > transport");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*" 
    },
    terminal: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|=Foo",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  });

  logger.info("=== transport.foo_schema > transport.foo_transfer");
  await transfer({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*"
    },
    terminal: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_transfer|*"
    }
  });

  logger.info("=== transport.foo_transfer > oracle_transfer.csv");
  await transfer({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./output/transport/|transfer.csv|*",
      options: {
        header: true
      }
    }
  });

}

(async () => {
  await tests();
})();
