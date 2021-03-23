/**
 * test/mssql
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../storage/logger');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql retrieve");
  await retrieve({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./output/mssql/retrieve_0.json"
    }
  });

  logger.info("=== mssql retrieve");
  await retrieve({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./output/mssql/retrieve_1.json"
    }
  });

  logger.info("=== mssql retrieve");
  await retrieve({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./output/mssql/retrieve_2.json"
    }
  });

  logger.info("=== mssql retrieve w/ cues");
  await retrieve({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    }
  });

  logger.info("=== mssql retrieve with pattern");
  await retrieve({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_transfer|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        count: 3,
        order: { "Dt Test": "asc" },
        fields: ["Foo", "Baz"]
      }
    }
  });

}

(async () => {
  await tests();
})();
