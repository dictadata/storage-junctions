/**
 * test/oracledb
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: oracledb transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  await dullSchema({
    smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
  });
/*
  logger.info("=== foofile.csv > oracledb.foo_schema");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo"
    }
  });

  logger.info("=== foofile_01.json > oracledb");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*" 
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|=Foo",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== foofile_02.json > oracledb");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*" 
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|=Foo",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  });
*/
  logger.info("=== oracledb.foo_schema > oracledb.foo_transfer");
  await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    },
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
    }
  });

  logger.info("=== oracledb.foo_transfer > oracle_transfer.csv");
  await transfer({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./output/oracledb/|transfer.csv|*",
      options: {
        header: true
      }
    }
  });

}

(async () => {
  await tests();
})();
