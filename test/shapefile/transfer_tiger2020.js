/**
 * test/shapefile/census
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: transfer tl_2020_us_state");


async function transfer1() {

  logger.verbose("=== Transfer shapefile .zip to geoJSON");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/data/US/census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*"
    },
    "terminal": {
      "smt": "json|./data/output/shapefile/|tl_2020_us_state.json|*"
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
      "smt": "elastic|http://dev.dictadata.org:9200/|tl_2020_us_state|*",
      "options": {
        "encoding": "./data/input/shapes/tl_YYYY_us_state.encoding.json"
      }
    }
  })) return 1;

}

async function transfer3() {

  logger.verbose("=== Transfer Elasticsearch to GeoJSON");
  if (await transfer({
    "origin": {
      "smt": "elastic|http://dev.dictadata.org:9200/|tl_2020_us_state|*"
    },
    "terminal": {
      "smt": "json|./data/output/shapefile/|tl_2020_us_state_elastic.json|*"
    }
  })) return 1;

}

async function transfer4() {

  logger.verbose("=== Transfer shapefile to elasticsearch");
  if (await transfer({
    "origin": {
      "smt": "shp|zip:/var/data/US/IA/legis.iowa.gov/Plan2/SHP/IA_ProposedPlan2_Oct2021.zip|Plan2_Congress|*",
      "options": {
        "encoding": "./data/input/shapes/bl_2020_ia_congress.encoding.json"
      }
    },
    "transforms": {
      "mutate": {
        "override": {
          "properties.STATEFP": "19"
        }
      }
    },
    "terminal": {
      "smt": "elasticsearch|http://dev.dictadata.org:9200|bl_2020_us_congress|*",
      "options": {
        "encoding": "./data/input/shapes/bl_2020_ia_congress.encoding.json"
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
