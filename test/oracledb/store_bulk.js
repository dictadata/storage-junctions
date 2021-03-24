/**
 * test/oracledb
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: oracledb bulk storage");

async function tests() {

  logger.info("=== oracledb storeBulk");
  await storeBulk({
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
  });

  logger.verbose('=== timeseries.csv > oracledb');
  await transfer({
    origin: {
      smt: "csv|./test/data/|timeseries.csv|*",
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
  });

}

(async () => {
  await tests();
})();
