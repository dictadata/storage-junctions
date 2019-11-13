/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../_getEncoding');
const putEncoding = require('../_putEncoding');
const logger = require('../../../lib/logger');

logger.info("=== Test: redshift");

async function tests() {

  logger.info("=== redshift putEncoding");
  await putEncoding({
    source: {
      smt: "redshift|DSN=drewlab|foo_schema|*"
    }
  });

  logger.info("=== redshift getEncoding");
  await getEncoding({
    source: {
      smt: "redshift|DSN=drewlab|foo_schema|*"
    },
    OutputFile: './test/output/redshift_foo_encoding.json'
  });

}

tests();
