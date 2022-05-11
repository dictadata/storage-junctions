/**
 * test/shapefile
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: shapefile transfer");

let compareValues = 2;

async function testTransfer1() {

  logger.verbose("=== Transfer polygons to geoJSON");
  if (await transfer({
    origin: {
      smt: "shp|./test/data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/shapefile/|polygons.json|*",
      output: "./test/data/output/shapefile/polygons.json"
    }
  }, compareValues)) return 1;

  logger.verbose("=== Transfer polygons to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|./test/data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "elastic|http://localhost:9200/|shapes|!geometry.type+properties.FID",
      options: {
        encoding: "./test/data/input/shapes/shapes.encoding.json"
      }
    }
  }, compareValues)) return 1;

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
      output: "./test/data/output/shapefile/points.json"
    }
  }, compareValues)) return 1;

  logger.verbose("=== Transfer points.zip to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|zip:./test/data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      smt: "elastic|http://localhost:9200/|shapes|!geometry.type+properties.FID",
      options: {
        encoding: "./test/data/input/shapes/shapes.encoding.json"
      }
    }
  }, compareValues)) return 1;

}

async function testTransfer3() {

  logger.verbose("=== Transfer elastic shapes to geoJSON");
  compareValues = 1;
  if (await transfer({
    "origin": {
      "smt": "elastic|http://localhost:9200/|shapes|!geometry.type+properties.FID"
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|shapes.json|*",
      "output": "./test/data/output/shapefile/shapes.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await testTransfer1()) return;
  if (await testTransfer2()) return;
  if (await testTransfer3()) return;
})();
