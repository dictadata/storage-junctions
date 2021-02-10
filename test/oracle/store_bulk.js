/**
 * test/oracle
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle bulk storage");

async function tests() {

  logger.info("=== oracle storeBulk");
  await storeBulk({
    origin: {
      smt: "oracle|connectString=localhost/XEPDB1;user=dicta;password=data|foo_schema|=Foo"
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

  logger.verbose('=== timeseries.csv > oracle');
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
      smt: "oracle|connectString=localhost/XEPDB1;user=dicta;password=data|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  });

}

(async () => {
  await tests();
})();
