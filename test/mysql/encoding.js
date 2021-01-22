/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql putEncoding");
  await putEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      encoding: "./test/data/encoding_foo.json"
    }
  });

  logger.info("=== mysql getEncoding");
  await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './test/output/mysql_encoding_foo.json'
    }
  });

  logger.info("=== mysql putEncoding");
  await putEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|*",
      encoding: "./test/data/encoding_foo_01.json"
    }
  });

  logger.info("=== mysql getEncoding");
  await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './test/output/mysql_encoding_foo_01.json'
    }
  });


  logger.info("=== mysql putEncoding");
  await putEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|*",
      encoding: "./test/data/encoding_foo_02.json"
    }
  });

  logger.info("=== mysql getEncoding");
  await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './test/output/mysql_encoding_foo_02.json'
    }
  });

}

tests();
