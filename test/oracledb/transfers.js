/**
 * test/oracledb
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: oracledb transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
  })) return 1;

  logger.info("=== foofile.csv > oracledb.foo_schema");
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo"
    }
  })) return 1;

  logger.info("=== foofile_01.json > oracledb");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile_01.json|*" 
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|=Foo",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_02.json > oracledb");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile_02.json|*" 
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|=Foo",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== oracledb.foo_schema > oracledb.foo_transfer");
  if (await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
    }
  })) return 1;

  logger.info("=== oracledb.foo_transfer > oracle_transfer.csv");
  if (await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./data/output/oracledb/|transfer.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
