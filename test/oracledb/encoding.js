/**
 * test/oracledb
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: oracledb");

async function tests() {

  logger.info("=== oracledb createSchema");
  await createSchema({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  });

  logger.info("=== oracledb get encoding");
  await getEncoding({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    },
    terminal: {
      output: './data/output/oracledb/encoding_foo.json'
    }
  });

  logger.info("=== oracledb createSchema");
  await createSchema({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== oracledb get encoding");
  await getEncoding({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*"
    },
    terminal: {
      output: './data/output/oracledb/encoding_foo_01.json'
    }
  });

  logger.info("=== oracledb createSchema");
  await createSchema({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  });

  logger.info("=== oracledb get encoding");
  await getEncoding({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*"
    },
    terminal: {
      output: './data/output/oracledb/encoding_foo_02.json'
    }
  });

  logger.info("=== oracledb large fields");
  await createSchema({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_lg|*",
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
