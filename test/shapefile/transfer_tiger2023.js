/**
 * test/shapefile/census
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('@dictadata/storage-lib');


logger.info("=== Test: transfer tl_2023_us_state");


async function transfer1() {

  logger.verbose("=== Transfer shapefile .zip to geoJSON");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/dictadata/US/census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip|tl_2023_us_state|*"
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|tl_2023_us_state.json|*"
    }
  })) return 1;

}

async function transfer2() {

  logger.verbose("=== Transfer shapefile .zip to Elasticsearch");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/dictadata/US/census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip|tl_2023_us_state|*"
    },
    "terminal": {
      "smt": "elastic|http://dev.dictadata.net:9200/|tl_2023_us_state|*",
      "options": {
        "encoding": "./test/data/input/engrams/tl_YYYY_us_state.engram.json"
      }
    }
  })) return 1;

}

async function transfer3() {

  logger.verbose("=== Transfer Elasticsearch to GeoJSON");
  if (await transfer({
    "origin": {
      "smt": "elastic|http://dev.dictadata.net:9200/|tl_2023_us_state|*"
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|tl_2023_us_state_elastic.json|*"
    }
  })) return 1;

}

async function transfer4() {

  logger.verbose("=== Transfer shapefile to elasticsearch");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/dictadata/IA/legis.iowa.gov/Plan2/SHP/IA_ProposedPlan2_Oct2021.zip|Plan2_Congress|*",
      "options": {
        "encoding": "./test/data/input/engrams/bl_2020_ia_congress.engram.json"
      }
    },
    "transforms": [
      {
        "transform": "mutate",
        "assign": {
          "properties.STATEFP": "19"
        }
      }
    ],
    "terminal": {
      "smt": "elasticsearch|http://dev.dictadata.net:9200|bl_2020_us_congress|*",
      "options": {
        "encoding": "./test/data/input/engrams/bl_2020_ia_congress.engram.json"
      }
    }
  })) return 1;

}

(async () => {
  if (await transfer1()) return 1;
  if (await transfer2()) return 1;
  if (await transfer3()) return 1;
  if (await transfer4()) return 1;
})();
