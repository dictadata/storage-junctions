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
      smt: "shp|./data/input/shapes/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/shapefile/|polygons.json|*",
      output: "./data/output/shapefile/polygons.json"
    }
  }, compareValues)) return 1;

  logger.verbose("=== Transfer polygons to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|./data/input/shapes/|polygons|*",
      options: {}
    },
    transform: {
      "mutate": {
        "default": {
          "id": "=geometry.type+properties.FID"
        }
      }
    },
    terminal: {
      smt: "elastic|http://dev.dictadata.org:9200/|shapes|!id",
      options: {
        encoding: "./data/input/shapes/shapes.encoding.json"
      }
    }
  }, compareValues)) return 1;

}

async function testTransfer2() {

  logger.verbose("=== Transfer points.zip to geoJSON");
  if (await transfer({
    origin: {
      smt: "shp|zip:./data/input/shapes/points.zip|points|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/shapefile/|points.json|*",
      output: "./data/output/shapefile/points.json"
    }
  }, compareValues)) return 1;

  logger.verbose("=== Transfer points.zip to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|zip:./data/input/shapes/points.zip|points|*",
      options: {}
    },
    transform: {
      "mutate": {
        "default": {
          "id": "=geometry.type+properties.FID"
        }
      }
    },
    terminal: {
      smt: "elastic|http://dev.dictadata.org:9200/|shapes|!id",
      options: {
        encoding: "./data/input/shapes/shapes.encoding.json"
      }
    }
  }, compareValues)) return 1;

}

async function testTransfer3() {

  logger.verbose("=== Transfer elastic shapes to geoJSON");
  compareValues = 2;
  if (await transfer({
    "origin": {
      "smt": "elastic|http://dev.dictadata.org:9200/|shapes|!id",
      "options": {},
      "pattern": {
        "order": {
          "id": "desc"
        },
        "count": 100
      }
    },
    "terminal": {
      "smt": "json|./data/output/shapefile/|shapes.json|*",
      "output": "./data/output/shapefile/shapes.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await testTransfer1()) return;
  if (await testTransfer2()) return;
  if (await testTransfer3()) return;
})();
