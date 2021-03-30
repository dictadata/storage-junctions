/**
 * test/mysql
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../storage/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./data/output/mysql/retrieve_0.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./data/test/encoding_foo_01.json",
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./data/output/mysql/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|*",
      options: {
        encoding: "./data/test/encoding_foo_02.json",
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./data/output/mysql/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    }
  })) return 1;

  logger.info("=== mysql retrieve with pattern");
  if (await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*",
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
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
