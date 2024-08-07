/**
 * test/mysql
 */
"use strict";

const retrieve = require('../_lib/_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: mysql retrieve");

async function tests() {

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: "./test/_data/output/mysql/retrieve_all.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*",
      pattern: {
        match: {},
        "order": { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/mysql/retrieve_0.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema_01.engram.json",
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./test/_data/output/mysql/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_widgets|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_widgets.engram.json",
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/mysql/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== mysql retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    }
  })) return 1;

  logger.info("=== mysql retrieve with pattern");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_transfer|*",
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
