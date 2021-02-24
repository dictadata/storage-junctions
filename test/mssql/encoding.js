/**
 * test/mssql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const logger = require('../../lib/logger');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql createSchema");
  await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      options: {
        encoding: "./test/data/encoding_foo.json"
      }
    }
  });

  logger.info("=== mssql get encoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './output/mssql/encoding_foo.json'
    }
  });

  logger.info("=== mssql createSchema");
  await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== mssql get encoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './output/mssql/encoding_foo_01.json'
    }
  });

  logger.info("=== mssql createSchema");
  await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  });

  logger.info("=== mssql get encoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './output/mssql/encoding_foo_02.json'
    }
  });

  logger.info("=== mssql large fields");
  await createSchema({
    origin: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|foo_schema_lg|*",
      options: {
        encoding: "./test/data/encoding_foo_lg.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  });

}

(async () => {
  await tests();
})();
