/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest encoding");

async function test1() {

  logger.info("=== rest getEncoding polygons");
  if (await getEncoding({
    origin: {
      smt: "shp|./data/test/shapefile/|polygons|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/polygons_encoding.json'
    }
  }, false)) return 1;

}

async function test2() {

  logger.info("=== rest getEncoding points");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:./data/test/shapefile/points.zip|points|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/points_encoding.json'
    }
  }, false)) return 1;

}

async function test3() {

  logger.info("=== rest getEncoding tl_2020_us_states");
  if (await getEncoding({
    origin: {
      smt: "shp|zip:/var/data/www2.census.gov/geo/tiger/TIGER2020/STATE/tl_2020_us_state.zip|tl_2020_us_state|*",
      options: {}
    },
    terminal: {
      output: './data/output/shapefile/tl_2020_us_states_encoding.json'
    }
  }, false)) return 1;

}

(async () => {
  if (await test1()) return;
  if (await test2()) return;
  if (await test3()) return;
})();