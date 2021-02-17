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
      output: './output/mysql/encoding_foo.json'
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
      output: './output/mysql/encoding_foo_01.json'
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
      output: './output/mysql/encoding_foo_02.json'
    }
  });

  logger.info("=== mysql large fields");
  await putEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_lg|*",
      options: {
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      },
      encoding: "./test/data/encoding_foo_lg.json"
    }
  });

  logger.info("=== mysql no none-keys");
  await putEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_two|*",
      encoding: "./test/data/encoding_foo_two.json"
    }
  });

}

(async () => {
  await tests();
})();
