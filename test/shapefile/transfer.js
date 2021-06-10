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
      smt: "shp|./data/test/shapefile/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/shapefile/|polygons.json|*",
      options: {}
    }
  })) return 1;

  logger.verbose("=== Transfer polygons to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|./data/test/shapefile/|polygons|*",
      options: {}
    },
    terminal: {
      smt: "elastic|http://localhost:9200/|shapes|*",
      options: {
        encoding: "./data/test/shapefile/encoding_shapes.json"
      }
    }
  })) return 1;

}

async function testTransfer2() {

  logger.verbose("=== Transfer points.zip to geoJSON");
  if (await transfer({
    origin: {
      smt: "shp|zip:./data/test/shapefile/points.zip|points|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/shapefile/|points.json|*",
      options: {}
    }
  })) return 1;

  logger.verbose("=== Transfer points.zip to elasticsearch");
  if (await transfer({
    origin: {
      smt: "shp|zip:./data/test/shapefile/points.zip|points|*",
      options: {}
    },
    terminal: {
      smt: "elastic|http://localhost:9200/|shapes|*",
      options: {
        encoding: "./data/test/shapefile/encoding_shapes.json"
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
      "smt": "json|./data/output/shapefile/|shapes.json|*"
    }
  })) return 1;

}

(async () => {
  if (await testTransfer1()) return;
  if (await testTransfer2()) return;
  if (await testTransfer3()) return;
})();
