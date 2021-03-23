/**
 * test/oracle
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: oracle");

async function tests() {

  logger.info("=== oracle createSchema");
  await createSchema({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
    }
  });

  logger.info("=== oracle get encoding");
  await getEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    },
    terminal: {
      output: './output/oracle/encoding_foo.json'
    }
  });

  logger.info("=== oracle createSchema");
  await createSchema({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== oracle get encoding");
  await getEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*"
    },
    terminal: {
      output: './output/oracle/encoding_foo_01.json'
    }
  });

  logger.info("=== oracle createSchema");
  await createSchema({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  });

  logger.info("=== oracle get encoding");
  await getEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*"
    },
    terminal: {
      output: './output/oracle/encoding_foo_02.json'
    }
  });

  logger.info("=== oracle large fields");
  await createSchema({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_lg|*",
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
