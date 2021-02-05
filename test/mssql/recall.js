/**
 * test/mssql
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../lib/logger');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql recall");
  await recall({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./output/mssql_recall.json"
    }
  });

  logger.info("=== mssql recall");
  await recall({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

(async () => {
  await tests();
})();
