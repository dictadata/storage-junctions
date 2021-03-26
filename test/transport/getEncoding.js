/**
 * test/transport
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const logger = require('../../storage/logger');

logger.info("=== Tests: transport getEncoding");

async function tests() {

  logger.info("=== transport getEncoding foo_schema");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*"
    },
    terminal: {
      output: './output/transport/encoding_foo.json'
    }
  });

  logger.info("=== transport getEncoding foo_schema_01");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './output/transport/encoding_foo_01.json'
    }
  });

  logger.info("=== transport getEncoding foo_schema_02");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './output/transport/encoding_foo_02.json'
    }
  });

  logger.info("=== transport getEncoding foo_schema_lg");
  await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_lg|*"
    },
    terminal: {
      output: './output/transport/encoding_foo_lg.json'
    }
  });

}

(async () => {
  await tests();
})();
