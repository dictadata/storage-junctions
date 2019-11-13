/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../_retrieve');
const logger = require('../../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== elasticsearch retrieve");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Foo": 'twenty'
        }
      }
    }
  });

  logger.info("=== elasticsearch retrieve with pattern");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        cues: {
          count: 3,
          order: { "Dt Test": "asc" },
          fields: ["Foo", "Baz"]
        }
      }
    }
  });

  logger.info("=== elasticsearch consolidate");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        consolidate: {
          "baz_sum": { "sum": "Baz" },
          "fobe_max": { "max": "Fobe" }
        }
      }
    }
  });

  logger.info("=== elasticsearch consolidate w/ groupby");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        consolidate: {
          "Bar": {
            "baz_sum": { "sum": "Baz" }
          }
        },
        "cues": {
          "order": { "baz_sum": "desc" },
          "count": 5
        }
      }
    }
  });

  logger.info("=== elasticsearch groupby with summary");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        consolidate: {
          "Dt Test": {
            "baz_sum": { "sum": "Baz" }
          },
          "baz_sum": { "sum": "Baz" }
        },
        cues: {
          "order": { "baz_sum": "desc" },
          "count": 10
        }
      }
    }
  });

}

tests();
