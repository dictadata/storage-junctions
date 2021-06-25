/**
 * test/transport
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('../../storage/utils');

logger.info("=== Test: transport");

async function tests() {

  logger.info("=== transport retrieve");
  if (await retrieve({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/data/output/transport/retrieve_0.json"
    }
  })) return 1;

  logger.info("=== transport retrieve");
  if (await retrieve({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|*",
      options: {
        encoding: "./test/data/input/encoding_foo_01.json"
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/data/output/transport/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== transport retrieve");
  if (await retrieve({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|*",
      options: {
        encoding: "./test/data/input/encoding_foo_02.json"
      },
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/data/output/transport/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== transport retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    }
  })) return 1;

  logger.info("=== transport retrieve with pattern");
  if (await retrieve({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_transfer|*",
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
