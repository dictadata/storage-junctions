/**
 * test/oracledb
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const dull = require('../lib/_dull');
const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: oracledb bulk storage");

async function tests() {

  logger.info("=== transportdb dull");
  if (await dull({
    origin: {
      smt: "oracledb|connectString=localhost/XEPDB1;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          Foo: {"wc": "one-*"}
        }
      }
    }
  })) return 1;

   logger.info("=== oracledb storeBulk");
  if (await storeBulk({
    origin: {
      smt: "oracledb|connectString=localhost/XEPDB1;user=dicta;password=data|foo_schema|=Foo"
    },
    constructs: [{
      Foo: 'one-o-five',
      Bar: 'Lincoln',
      Baz: 105
    },{
      Foo: 'one-ten',
      Bar: 'Hamilton',
      Baz: 110
    },{
      Foo: 'one-twenty',
      Bar: 'Jackson',
      Baz: 120
    }]
  })) return 1;

  logger.verbose('=== timeseries.csv > oracledb');
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          "time": "date",
          "temp": "number"
        }
      }
    },
    terminal: {
      smt: "oracledb|connectString=localhost/XEPDB1;user=dicta;password=data|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
