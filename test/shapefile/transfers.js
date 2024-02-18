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
    transforms: [
      {
        transform: "mutate",
        "default": {
          "id": "=geometry.type+properties.FID"
        }
      }
    ],
    terminal: {
      smt: "elastic|http://dev.dictadata.net:9200/|shapes|!id",
      options: {
        encoding: "./test/data/input/engrams/shapes.engram.json"
      }
    }
  }, compareValues)) return 1;

}

async function testTransfer2() {

  logger.verbose("=== Transfer2 points.zip to geoJSON");
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

  logger.verbose("=== Transfer2 points.zip to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|zip:./test/data/input/shapes/points.zip|points|*",
      options: {}
    },
    transforms: [
      {
        transform: "mutate",
        "default": {
          "id": "=geometry.type+properties.FID"
        }
      }
    ],
    terminal: {
      smt: "elastic|http://dev.dictadata.net:9200/|shapes|!id",
      options: {
        encoding: "./test/data/input/engrams/shapes.engram.json"
      }
    }
  }, compareValues)) return 1;

}

async function testTransfer3() {

  logger.verbose("=== Transfer3 elastic shapes to geoJSON");
  compareValues = 2;
  if (await transfer({
    "origin": {
      "smt": "elastic|http://dev.dictadata.net:9200/|shapes|!id",
      "options": {},
      "pattern": {
        "order": {
          "id": "desc"
        },
        "count": 100
      }
    },
    "terminal": {
      "smt": "json|./test/data/output/shapefile/|shapes.json|*",
      "output": "./test/data/output/shapefile/shapes.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  let rc = await testTransfer1();
  if (rc) return 1;
  rc = await testTransfer2();
  if (rc) return 1;
  rc = await testTransfer3();
  if (rc) return 1;
})();
