/**
 * test/xlsx/encoding
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== xlsx putEncoding");
  await putEncoding({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx getEncoding");
  await getEncoding({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    },
    OutputFile: './test/output/xlsx_foo_encoding.json'
  });

}

tests();
