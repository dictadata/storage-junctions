/**
 * test/transform
 */
"use strict";

const transfer = require('../_lib/_transfer');
const dullSchema = require('../_lib/_dullSchema');
const Engram = require('../../storage/types/engram');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: db2db_transforms");

async function testDBTransform1(tract) {
  let engram = new Engram(tract.terminal.smt);
  logger.info("=== DBTRANSFORM1 elasticsearch > " + engram.smt.model);
  logger.verbose("=== " + engram.smt.model + "||" + engram.smt.schema);

  if (await transfer({
    "origin": {
      "smt": "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
      "options": {}
    },
    "terminal": tract.terminal,
    "transforms": [
      {
        "transform": "filter",
        "match": {
          "Bar": "row"
        },
        "drop": {
          "Baz": { "eq": 456 }
        }
      },
      {
        "transform": "mutate",
        "default": {
          "Fie": "where's fum?"
        },
        "map": {
          "foo": "=Foo",
          "bar": "=Bar",
          "baz": "=Baz",
          "fobe": "=Fobe",
          "dt_test": "=Dt Test",
          "enabled": "=enabled",
          "state": "=subObj1.state",
          "izze": "=subObj2.subsub.izze"
        }
      }
    ]
  })) return 1;

}

async function testDBTransform2() {

  logger.info("=== DBTRANSFORM2 mysql > elasticsearch");
  logger.verbose("=== elasticsearch||foo_dbtransform");

  if (await transfer({
    "origin": {
      "smt": "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|=Foo",
      "options": {}
    },
    "transforms": [
      {
        "transform": "filter",
        "match": {
          "Bar": { "eq": "row" }
        },
        "drop": {
          "Baz": 5678
        }
      },
      {
        "transform": "mutate",
        "default": {
          "Fie": "where's fum?"
        },
        "map": {
          "Foo": "=Foo",
          "Bar": "=Bar",
          "Bazzy": "=Baz"
        }
      }
    ],
    "terminal": {
      "smt": "elasticsearch|http://dev.dictadata.net:9200|foo_dbtransform|=Foo",
      "options": {}
    }
  })) return 1;

}

async function forecastTransform(tract) {

  let engram = new Engram(tract.terminal.smt);
  logger.info("=== WEATHER FORECAST API to " + engram.smt.model);
  logger.verbose("=== " + engram.smt.model + "||" + engram.smt.schema);

  if (await dullSchema(tract.terminal))
    return 1;

  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.net/storage contact:info@dictadata.net"
          }
        },
        retries: 1,
        pick: "periods"
      }
    },
    "transforms": [
      {
        "transform": "mutate",
        "assign": {
          "Fie": "It's always sunny in Philadelphia?"
        }
      }
    ],
    "terminal": tract.terminal
  })) return 1;

}

(async () => {

  if (await testDBTransform1({
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_dbtransform|=foo"
    }
  })) return;

  if (await testDBTransform2())
    return 1;

  if (await forecastTransform({
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|weather_forecast|=Foo"
    }
  })) return;
/*
  if (await forecastTransform({
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|weather_forecast|*"
    }
  })) return;
*/
})();
