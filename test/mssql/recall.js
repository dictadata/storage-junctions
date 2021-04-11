/**
 * test/mssql
 */
"use strict";

const recall = require('../lib/_recall');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql recall");
  if (await recall({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/mssql/recall_01.json"
    }
  })) return 1;

  logger.info("=== mssql recall");
  if (await recall({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    },
    terminal: {
      output: "./data/output/mssql/recall_02.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
