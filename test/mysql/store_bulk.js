/**
 * test/mysql
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mysql bulk storage");

async function tests() {

  logger.info("=== mysql storeBulk");
  if (await storeBulk({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|=Foo"
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
    } ],
    terminal: {
      output: "./test/data/output/mysql/store_bulk_01.json"
    }
  })) return 1;

  logger.verbose('=== timeseries.csv > mysql');
  if (await transfer({
    origin: {
      smt: "csv|/var/dictadata/test/data/input/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          fields: {
            "time": "date",
            "temp": "number"
          }
        }
      }
    },
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
