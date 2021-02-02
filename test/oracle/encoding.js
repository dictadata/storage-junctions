/**
 * test/oracle
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle");

async function tests() {

  logger.info("=== oracle putEncoding");
  await putEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      encoding: "./test/data/encoding_foo.json"
    }
  });

  logger.info("=== oracle getEncoding");
  await getEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    },
    terminal: {
      output: './test/output/oracle_encoding_foo.json'
    }
  });

  logger.info("=== oracle putEncoding");
  await putEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*",
      encoding: "./test/data/encoding_foo_01.json"
    }
  });

  logger.info("=== oracle getEncoding");
  await getEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|*"
    },
    terminal: {
      output: './test/output/oracle_encoding_foo_01.json'
    }
  });


  logger.info("=== oracle putEncoding");
  await putEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*",
      encoding: "./test/data/encoding_foo_02.json"
    }
  });

  logger.info("=== oracle getEncoding");
  await getEncoding({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|*"
    },
    terminal: {
      output: './test/output/oracle_encoding_foo_02.json'
    }
  });

}

tests();
