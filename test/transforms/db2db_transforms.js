/**
 * test/transform
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require("../lib/_dullSchema");
const Engram = require('../../storage/types/engram');
const logger = require('../../storage/logger');

logger.info("=== Test: transform");

async function testDBTransform1(tract) {
  let engram = new Engram(tract.terminal.smt);
  logger.info("=== DBTRANSFORM1 elasticsearch > " + engram.smt.model);
  logger.verbose("=== " + engram.smt.model + "||" + engram.smt.schema);

  await transfer({
    "origin": {
      "smt": "elasticsearch|http://localhost:9200|foo_schema|*",
      "options": {}
    },
    "terminal": tract.terminal,
    "transforms": {
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
  });

}

async function testDBTransform2() {

  logger.info("=== DBTRANSFORM2 mysql > elasticsearch");
  logger.verbose("=== elasticsearch||foo_dbtransform");

  await transfer({
    "origin": {
      "smt": "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|=Foo",
      "options": {}
    },
    "transforms": {
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
  });

}

async function forecastTransform(tract) {

  let engram = new Engram(tract.terminal.smt);
  logger.info("=== WEATHER FORECAST API to " + engram.smt.model);
  logger.verbose("=== " + engram.smt.model + "||" + engram.smt.schema);

  await dullSchema(tract.terminal);

  await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
        },
        extract: {
          data: "periods",  // name of property in response.data than contains the desired object or array
          names: ""         // name of property in response.data containing an array of field names
          // if names is empty then data should be a json object or array of json objects
        }
      }
    },
    "transforms": {
      "select": {
        "inject_after": {
          "Fie": "It's always sunny in Philadelphia?"
        }
      }
    },
    "terminal": tract.terminal
  });

}

(async () => {

  await testDBTransform1({
    terminal: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|foo_dbtransform|=foo"
    }
  });
  await testDBTransform1({
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_dbtransform|=foo"
    }
  });
  await testDBTransform1({
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_dbtransform|*"
    }
  });

  await testDBTransform2();

  await forecastTransform({
    terminal: {
      smt: "elasticsearch|http://localhost:9200|weather_forecast|=Foo"
    }
  });
    await forecastTransform({
    terminal: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|weather_forecast|*"
    }
  });
  await forecastTransform({
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|weather_forecast|*"
    }
  });
  await forecastTransform({
    terminal: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|weather_forecast|*"
    }
  });
})();
