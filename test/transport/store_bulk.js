/**
 * test/transportdb
 */
"use strict";

const storeBulk = require('../lib/_store_bulk');
const dull = require('../lib/_dull');
const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: transportdb bulk storage");

async function tests() {

  logger.info("=== transportdb dull");
  if (await dull({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: {"wc": "one-*"}
        }
      }
    }
  })) return 1;

  logger.info("=== transportdb storeBulk");
  if (await storeBulk({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo"
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

  logger.verbose('=== timeseries.csv > transportdb');
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
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|timeseries|*",
      options: {
        bulkLoad: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
