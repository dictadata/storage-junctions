/**
 * test/shapefile
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: shapefile transfer");

async function testTransfer1() {

  logger.verbose("=== Transfer polygons to geoJSON");
  if (await transfer({
    origin: {
      smt: "shp|./test/data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/shapefile/|polygons.json|*",
      options: {}
    }
  })) return 1;

  logger.verbose("=== Transfer polygons to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|./test/data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "elastic|http://localhost:9200/|shapes|*",
      options: {
        encoding: "./test/data/input/shapes/polygons-encoding.json"
      }
    }
  })) return 1;

}

async function testTransfer2() {

  logger.verbose("=== Transfer points.zip to geoJSON");
  if (await transfer({
    origin: {
      smt: "shp|zip:./test/data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/shapefile/|points.json|*",
      options: {}
    }
  })) return 1;

  logger.verbose("=== Transfer points.zip to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|zip:./test/data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      smt: "elastic|http://localhost:9200/|shapes|*",
      options: {
        encoding: "./test/data/input/shapes/points-encoding.json"
      }
    }
  })) return 1;

}

async function testTransfer3() {

  logger.verbose("=== Transfer elastic to geoJSON");
  if (await transfer({
    "origin": {
      "smt": "elastic|http://localhost:9200/|shapes|*"
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|shapes.json|*"
    }
  })) return 1;

}

(async () => {
  if (await testTransfer1()) return;
  if (await testTransfer2()) return;
  if (await testTransfer3()) return;
})();
