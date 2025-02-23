/**
 * test/mysql
 */
"use strict";

const codify = require('../_lib/_codify');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: shapefile encoding");

async function test1() {

  logger.info("=== shapefile codify polygons");
  if (await codify({
    origin: {
      smt: "shp|./test/_data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      output: './test/_data/output/shapefile/polygons.engram.json'
    }
  })) return 1;

}

async function test2() {

  logger.info("=== shapefile codify points");
  if (await codify({
    origin: {
      smt: "shp|zip:./test/_data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      output: './test/_data/output/shapefile/points.engram.json'
    }
  })) return 1;

}

async function test3() {

  logger.info("=== shapefile codify tl_2023_us_state");
  if (await codify({
    origin: {
      smt: "shp|zip:/var/dictadata/US/census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip|tl_2023_us_state|*",
      options: {}
    },
    terminal: {
      output: './test/_data/output/shapefile/tl_2023_us_state.engram.json'
    }
  })) return 1;

}

async function test4() {

  logger.info("=== shapefile codify tl_2023_us_county");
  if (await codify({
    origin: {
      smt: "shp|zip:/var/dictadata/US/census.gov/geo/tiger/TIGER2023/COUNTY/tl_2023_us_county.zip|tl_2023_us_county|*",
      options: {}
    },
    terminal: {
      output: './test/_data/output/shapefile/tl_2023_us_county.engram.json'
    }
  })) return 1;

}

async function test5() {

  logger.info("=== shapefile codify from Ames.zip");
  if (await codify({
    origin: {
      smt: "shp|zip:/var/dictadata/IA/sos.iowa.gov/shapefiles/City Precincts/Ames.zip/Ames/|$1|*",
      options: {}
    },
    terminal: {
      output: './test/_data/output/shapefile/ames_precincts.engram.json'
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
