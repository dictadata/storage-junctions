/**
 * test/mssql
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mssql bulk storage");

async function tests() {

  logger.info("=== mssql storeBulk");
  await storeBulk({
    origin: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|foo_schema|=Foo"
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

  logger.verbose('=== timeseries.csv > mssql');
  await transfer({
    origin: {
      smt: "csv|./test/data/|timeseries.csv|*",
      options: {
        header: false
      },
      encoding: {
        "time": "date",
        "temp": "number"
      }
    },
    terminal: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  });

}

(async () => {
  await tests();
})();
