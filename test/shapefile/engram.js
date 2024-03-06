/**
 * test/mysql
 */
"use strict";

const getEngram = require('../lib/_getEngram');
const { logger } = require('../../storage/utils');

logger.info("=== Test: shapefile encoding");

async function test1() {

  logger.info("=== shapefile getEngram polygons");
  if (await getEngram({
    origin: {
      smt: "shp|./test/data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/polygons.engram.json'
    }
  })) return 1;

}

async function test2() {

  logger.info("=== shapefile getEngram points");
  if (await getEngram({
    origin: {
      smt: "shp|zip:./test/data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/points.engram.json'
    }
  })) return 1;

}

async function test3() {

  logger.info("=== shapefile getEngram tl_2023_us_state");
  if (await getEngram({
    origin: {
      smt: "shp|zip:/var/dictadata/US/census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip|tl_2023_us_state|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/tl_2023_us_state.engram.json'
    }
  })) return 1;

}

async function test4() {

  logger.info("=== shapefile getEngram tl_2023_us_county");
  if (await getEngram({
    origin: {
      smt: "shp|zip:/var/dictadata/US/census.gov/geo/tiger/TIGER2023/COUNTY/tl_2023_us_county.zip|tl_2023_us_county|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/tl_2023_us_county.engram.json'
    }
  })) return 1;

}

async function test5() {

  logger.info("=== shapefile getEngram from Ames.zip");
  if (await getEngram({
    origin: {
      smt: "shp|zip:/var/dictadata/US/IA/sos.iowa.gov/shapefiles/City Precincts/Ames.zip/Ames/|$1|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/ames_precincts.engram.json'
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
