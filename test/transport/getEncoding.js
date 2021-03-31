/**
 * test/transport
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const logger = require('../../storage/logger');

logger.info("=== Tests: transport getEncoding");

async function tests() {

  logger.info("=== transport getEncoding foo_schema");
  if (await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*"
    },
    terminal: {
      output: './data/output/transport/encoding_foo.json'
    }
  })) return 1;

  logger.info("=== transport getEncoding foo_schema_01");
  if (await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './data/output/transport/encoding_foo_01.json'
    }
  })) return 1;

  logger.info("=== transport getEncoding foo_schema_02");
  if (await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './data/output/transport/encoding_foo_02.json'
    }
  })) return 1;

  logger.info("=== transport getEncoding foo_schema_lg");
  if (await getEncoding({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_lg|*"
    },
    terminal: {
      output: './data/output/transport/encoding_foo_lg.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
