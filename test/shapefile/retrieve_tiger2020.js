/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: elasticsearch shape queries");

async function tests() {

  logger.info("=== elasticsearch retrieve");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|geo_2020_us_state|*",
      pattern: {
        match: {
          "properties.STUSPS": "NY"
        }
      }
    },
    terminal: {
      output: "./data/output/shapefile/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|geo_2020_us_state|*",
      pattern: {
        match: {
          "geometry": {
            "contains": [ -73.985428, 40.748817 ]
          }
        }
      }
    },
    terminal: {
      output: "./data/output/shapefile/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve w/ pattern");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|geo_2020_us_state|*",
      pattern: {
        match: {
          "properties.LSAD": "00",
          "geometry": {
            "contains": [ -73.985428, 40.748817 ]
          }
        }
      }
    },
    terminal: {
      output: "./data/output/shapefile/retrieve_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
