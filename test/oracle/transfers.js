/**
 * test/oracle
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle transfers");

async function tests() {

  logger.info("=== foofile.csv > oracle.foo_schema");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    }
  });

  logger.info("=== foofile_01.json > oracle");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*" 
    },
    terminal: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|=Foo",
      encoding: "./test/data/encoding_foo_01.json"
    }
  });

  logger.info("=== foofile_02.json > oracle");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*" 
    },
    terminal: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|=Foo",
      encoding: "./test/data/encoding_foo_02.json"
    }
  });

  logger.info("=== oracle.foo_schema > oracle.foo_transfer");
  await transfer({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*"
    },
    terminal: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
    }
  });

  logger.info("=== oracle.foo_transfer > oracle_transfer.csv");
  await transfer({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./output/oracle/|transfer.csv|*",
      options: {
        header: true
      }
    }
  });

}

(async () => {
  await tests();
})();
