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
      smt: "shp|./test/data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/polygons.encoding.json'
    }
  })) return 1;

}

async function test2() {

  logger.info("=== shapefile getEncoding points");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:./test/data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      output: './test/data/output/shapefile/points.encoding.json'
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
      output: './test/data/output/shapefile/tl_2020_us_state.encoding.json'
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
      output: './test/data/output/shapefile/tl_2020_us_county.encoding.json'
    }
  })) return 1;

}

(async () => {
  if (await test1()) return 1;
  if (await test2()) return 1;
  if (await test3()) return 1;
  if (await test4()) return 1;
})();
