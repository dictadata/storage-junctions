/**
 * test/mysql
 */
"use strict";

const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const dull = require('./_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql store");
  await store({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== mysql store");
  await store({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  });

  logger.info("=== mysql recall");
  await recall({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|=Foo",
      options: {
        Foo: 'twenty'
      }
    }
  });

  logger.info("=== mysql recall");
  await recall({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
      options: {
        Foo: 'twenty'
      }
    }
  });

  logger.info("=== mysql retrieve");
  await retrieve({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
      options: {
        pattern: {
          match: {
            "Foo": 'twenty'
          }
        }
      }
    }
  });

  logger.info("=== mysql retrieve with pattern");
  await retrieve({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
      options: {
        pattern: {
          match: {
            "Foo": "first",
            "Baz": { "gte": 0, "lte": 1000 }
          },
          cues: {
            count: 3,
            order: { "Dt Test": "asc" },
            fields: ["Foo","Baz"]
          }
        }
      }
    }
  });

  logger.info("=== mysql dull");
  await dull({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
      options: {
        Foo: 'twenty'
      }
    }
  });

}

tests();
