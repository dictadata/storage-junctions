/**
 * test/shapefile/census
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: census transfer");


async function transferState() {

  logger.verbose("=== Transfer tl_2020_us_state.zip to geoJSON");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/data/www2.census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*"
    },
    "terminal": {
      "smt": "json|./data/output/shapefile/|tl_2020_us_state.json|*"
    }
  })) return 1;

  logger.verbose("=== Transfer tl_2020_us_state.zip to Elasticsearch");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/data/www2.census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*",
      "options": {
        "encoding": "./data/test/shapefile/encoding_tl_2020_us_state.json"
      }
    },
    "terminal": {
      "smt": "elastic|http://localhost:9200/|census2020|*"
    }
  })) return 1;

  logger.verbose("=== Transfer Elasticsearch to tl_2020_us_state.zip");
  if (await transfer({
    "origin": {
      "smt": "elastic|http://localhost:9200/|census2020|*",
      "options": {
        "encoding": "./data/test/shapefile/encoding_tl_2020_us_state.json"
      }
    },
    "terminal": {
      "smt": "json|./data/output/shapefile/|tl_2020_us_state_elastic.json|*"
    }
  })) return 1;

}

(async () => {
  if (await transferState()) return;

})();
