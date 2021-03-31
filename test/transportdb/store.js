/**
 * test/transportdb
 */
"use strict";

const store = require('../lib/_store');
const logger = require('../../storage/logger');

logger.info("=== Test: transportdb");

async function tests() {

  logger.info("=== transportdb store firsty");
  // INSERT INTO foo_schema ("Foo","Bar","Baz","Fobe","Dt Test","enabled") 
  // VALUES('first', 'row', 123, 1, TO_DATE('2018-10-07 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), 1);
  if (await store({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'firsty',
      Bar: 'row',
      Baz: 123,
      Fobe: 1,
      "Dt Test": "2018-10-07",
      enabled: false
    }
  })) return 1;


  logger.info("=== transportdb store 20");
  if (await store({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  })) return 1;

  logger.info("=== transportdb store 30");
  if (await store({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  })) return 1;

  logger.info("=== transportdb store 10");
  if (await store({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      enabled: false
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
