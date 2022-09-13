/**
 * test/transform
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require("../lib/_dullSchema");
const Engram = require('../../storage/types/engram');
const { logger } = require('../../storage/utils');

logger.info("=== Test: db2db_transforms");

async function testDBTransform1(tract) {
  let engram = new Engram(tract.terminal.smt);
  logger.info("=== DBTRANSFORM1 elasticsearch > " + engram.smt.model);
  logger.verbose("=== " + engram.smt.model + "||" + engram.smt.schema);

  if (await transfer({
    "origin": {
      "smt": "elasticsearch|http://localhost:9200|foo_schema|*",
      "options": {}
    },
    "terminal": tract.terminal,
    "transform": {
      "filter": {
        "match": {
          "Bar": "row"
        },
        "drop": {
          "Baz": { "eq": 456 }
        }
      },
      "select": {
        "inject_before": {
          "Fie": "where's fum?"
        },
        "fields": {
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "Fobe": "fobe",
          "Dt Test": "dt_test",
          "enabled": "enabled",
          "subObj1.state": "state",
          "subObj2.subsub.izze": "izze"
        }
      }
    }
  })) return 1;

}

async function testDBTransform2() {

  logger.info("=== DBTRANSFORM2 mysql > elasticsearch");
  logger.verbose("=== elasticsearch||foo_dbtransform");

  if (await transfer({
    "origin": {
      "smt": "mysql|host=localhost;database=storage_node|foo_schema|=Foo",
      "options": {}
    },
    "transform": {
      "filter": {
        "match": {
          "Bar": { "eq": "row" }
        },
        "drop": {
          "Baz": 5678
        }
      },
      "select": {
        "inject_before": {
          "Fie": "where's fum?"
        },
        "fields": {
          "Foo": "Foo",
          "Bar": "Bar",
          "Baz": "Bazzy"
        }
      }
    },
    "terminal": {
      "smt": "elasticsearch|http://localhost:9200|foo_dbtransform|=Foo",
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
            "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
          }
        },
        extract: "periods"
      }
    },
    "transform": {
      "select": {
        "inject_after": {
          "Fie": "It's always sunny in Philadelphia?"
        }
      }
    },
    "terminal": tract.terminal
  })) return 1;

}

(async () => {

  if (await testDBTransform1({
    terminal: {
      smt: "mssql|server=localhost;database=storage_node|foo_dbtransform|=foo"
    }
  })) return;

  if (await testDBTransform1({
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|foo_dbtransform|=foo"
    }
  })) return;

  if (await testDBTransform2())
    return 1;

  if (await forecastTransform({
    terminal: {
      smt: "elasticsearch|http://localhost:9200|weather_forecast|=Foo"
    }
  })) return;

  if (await forecastTransform({
    terminal: {
      smt: "mssql|server=localhost;database=storage_node|weather_forecast|*"
    }
  })) return;

  if (await forecastTransform({
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|weather_forecast|*"
    }
  })) return;

})();
