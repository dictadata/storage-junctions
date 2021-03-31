/**
 * test/transportdb
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const logger = require('../../storage/logger');

logger.info("=== Tests: transportdb getEncoding");

async function tests() {

  logger.info("=== transportdb getEncoding foo_schema");
  if (await getEncoding({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|*"
    },
    terminal: {
      output: './data/output/transportdb/encoding_foo.json'
    }
  })) return 1;

  logger.info("=== transportdb getEncoding foo_schema_01");
  if (await getEncoding({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './data/output/transportdb/encoding_foo_01.json'
    }
  })) return 1;

  logger.info("=== transportdb getEncoding foo_schema_02");
  if (await getEncoding({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './data/output/transportdb/encoding_foo_02.json'
    }
  })) return 1;

  logger.info("=== transportdb getEncoding foo_schema_lg");
  if (await getEncoding({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_lg|*"
    },
    terminal: {
      output: './data/output/transportdb/encoding_foo_lg.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
