/**
 * test/mysql
 */
"use strict";

const recall = require('../_recall');
const logger = require('../../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql recall");
  await recall({
    source: {
      smt: "redshift|DSN=drewlab|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

  logger.info("=== mysql recall");
  await recall({
    source: {
      smt: "redshift|DSN=drewlab|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

tests();
