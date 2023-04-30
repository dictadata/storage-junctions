/**
 * test/mssql
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql retrieve");
  if (await retrieve({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_schema|*",
      pattern: {
        match: {},
        "order": { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./data/output/mssql/retrieve_0.json"
    }
  })) return 1;

  logger.info("=== mssql retrieve");
  if (await retrieve({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./data/input/encodings/foo_schema_01.encoding.json"
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./data/output/mssql/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== mssql retrieve");
  if (await retrieve({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./data/input/encodings/foo_schema_02.encoding.json"
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./data/output/mssql/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== mssql retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_schema|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    }
  })) return 1;

  logger.info("=== mssql retrieve with pattern");
  if (await retrieve({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|foo_transfer|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        count: 3,
        order: { "Dt Test": "asc" },
        fields: [ "Foo", "Baz" ]
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
