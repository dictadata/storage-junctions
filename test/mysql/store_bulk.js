/**
 * test/mysql
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: mysql bulk storage");

async function tests() {

  logger.info("=== mysql storeBulk");
  await storeBulk({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|=Foo"
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

  logger.verbose('=== timeseries.csv > mysql');
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
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  });

}

(async () => {
  await tests();
})();
