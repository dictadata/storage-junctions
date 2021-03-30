/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql createSchema");
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  })) return 1;

  logger.info("=== mysql get encoding");
  if (await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './data/output/mysql/encoding_foo.json'
    }
  })) return 1;

  logger.info("=== mysql createSchema");
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== mysql get encoding");
  if (await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './data/output/mysql/encoding_foo_01.json'
    }
  })) return 1;

  logger.info("=== mysql createSchema");
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== mysql get encoding");
  if (await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './data/output/mysql/encoding_foo_02.json'
    }
  })) return 1;

  logger.info("=== mysql large fields");
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_lg|*",
      options: {
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      },
      options: {
        encoding: "./data/test/encoding_foo_lg.json"
      }
    }
  })) return 1;

  logger.info("=== mysql no none-keys");
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_two|*",
      options: {
        encoding: "./data/test/encoding_foo_two.json"
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
