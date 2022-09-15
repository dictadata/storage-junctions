/**
 * test/mssql
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql bulk storage");

async function tests() {

  logger.info("=== mssql storeBulk");
  if (await storeBulk({
    origin: {
      smt: "mssql|server=dev.dictadata.org;database=storage_node|foo_schema|=Foo"
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

  logger.verbose('=== timeseries.csv > mssql');
  if (await transfer({
    origin: {
      smt: "csv|/var/data/dictadata.org/test/input/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          "time": "date",
          "temp": "number"
        }
      }
    },
    terminal: {
      smt: "mssql|server=dev.dictadata.org;database=storage_node|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
