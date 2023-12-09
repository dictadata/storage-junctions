/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

logger.info("=== Test: shapefile encoding");

async function test1() {

  logger.info("=== shapefile getEncoding polygons");
  if (await getEncoding({
    origin: {
      smt: "shp|./data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/polygons.encoding.json'
    }
  })) return 1;

}

async function test2() {

  logger.info("=== shapefile getEncoding points");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:./data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/points.encoding.json'
    }
  })) return 1;

}

async function test3() {

  logger.info("=== shapefile getEncoding tl_2020_us_state");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:/var/data/US/census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/tl_2020_us_state.encoding.json'
    }
  })) return 1;

}

async function test4() {

  logger.info("=== shapefile getEncoding tl_2020_us_county");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:/var/data/US/census.gov/geo/tiger/TIGER2020/COUNTY/tl_2020_us_county.zip|tl_2020_us_county|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/tl_2020_us_county.encoding.json'
    }
  })) return 1;

}

async function test5() {

  logger.info("=== shapefile getEncoding from Ames.zip");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:/var/data/US/IA/sos.iowa.gov/shapefiles/City Precincts/Ames.zip/Ames/|~1|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/ames_precincts.encoding.json'
    }
  })) return 1;

}

(async () => {
  if (await test1()) return 1;
  if (await test2()) return 1;
  if (await test3()) return 1;
  if (await test4()) return 1;
  if (await test5()) return 1;
})();
