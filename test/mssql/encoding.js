/**
 * test/mssql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql createSchema");
  if (await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  })) return 1;

  logger.info("=== mssql get encoding");
  if (await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './data/output/mssql/encoding_foo.json'
    }
  })) return 1;

  logger.info("=== mssql createSchema");
  if (await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== mssql get encoding");
  if (await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './data/output/mssql/encoding_foo_01.json'
    }
  })) return 1;

  logger.info("=== mssql createSchema");
  if (await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== mssql get encoding");
  if (await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './data/output/mssql/encoding_foo_02.json'
    }
  })) return 1;

  logger.info("=== mssql large fields");
  if (await createSchema({
    origin: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|foo_schema_lg|*",
      options: {
        encoding: "./data/test/encoding_foo_lg.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
