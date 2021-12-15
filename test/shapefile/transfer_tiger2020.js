/**
 * test/shapefile/census
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: transfer tiger2020");


async function transfer1() {

  logger.verbose("=== Transfer shapefile .zip to geoJSON");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/data/US/census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*"
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|tl_2020_us_state.json|!properties.STUSPS+'_'+properties.GEOID+'_state'"
    }
  })) return 1;

}

async function transfer2() {

  logger.verbose("=== Transfer shapefile .zip to Elasticsearch");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/data/US/census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*"
    },
    "terminal": {
      "smt": "elastic|http://localhost:9200/|tiger2020|!properties.STUSPS+'_'+properties.GEOID+'_state'",
      "options": {
        "encoding": "./test/data/input/shapes/tl_2020_us_state.encoding.json"
      }
    }
  })) return 1;

}

async function transfer3() {

  logger.verbose("=== Transfer Elasticsearch to GeoJSON");
  if (await transfer({
    "origin": {
      "smt": "elastic|http://localhost:9200/|tiger2020|!properties.STUSPS+'_'+properties.GEOID+'_state'"
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|tl_2020_us_state_elastic.json|*"
    }
  })) return 1;

}

(async () => {
  if (await transfer1()) return 1;
  if (await transfer2()) return 1;
  if (await transfer3()) return 1;

})();
