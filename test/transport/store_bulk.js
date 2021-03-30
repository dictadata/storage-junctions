/**
 * test/transport
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: transport bulk storage");

async function tests() {

  logger.info("=== transport storeBulk");
  if (await storeBulk({
    origin: {
      smt: "transport|connectString=localhost/XEPDB1;user=dicta;password=data|foo_schema|=Foo"
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

  logger.verbose('=== timeseries.csv > transport');
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
      smt: "transport|connectString=localhost/XEPDB1;user=dicta;password=data|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
