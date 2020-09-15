/**
 * test/transform
 */
"use strict";

const transfer = require('./lib/_transfer');
const Engram = require('../lib/engram');
const logger = require('../lib/logger');

logger.info("=== Test: transform");

async function testDBTransform1() {
  logger.info("=== elasticsearch > mysql");
  logger.verbose('>>> mysql foo_dbtransform');

  await transfer({
    "origin": {
      "smt": "elasticsearch|http://localhost:9200|foo_schema|*",
      "options": {}
    },
    "terminal": {
      "smt": "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_dbtransform|=Foo",
      "options": {}
    },
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

  logger.info("=== mysql > elasticsearch");
  logger.verbose(">>> elasticsearch foo_dbtransform");

  await transfer({
    "origin": {
      "smt": "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
      "options": {}
    },
    "terminal": {
      "smt": "elasticsearch|http://localhost:9200|foo_dbtransform|=Foo",
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
    }
  });

}

async function forecastTransform(tract) {

  let engram = new Engram(tract.terminal.smt);
  logger.info("=== transfer REST to " + engram.smt.model);
  logger.verbose("<<< weather API");
  logger.verbose(">>> " + engram.smt.model + " " + engram.smt.schema);

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
    "terminal": {
      "smt": tract.terminal.smt,
      "options": {}
    },
    "transforms": {
      "select": {
        "inject_after": {
          "Fie": "It's always sunny in Philadelphia?"
        }
      }
    }
  });

}

async function tests() {
  await testDBTransform1();
  await testDBTransform2();
  await forecastTransform({ terminal: { smt: "elasticsearch|http://localhost:9200|weather_forecast|=Foo" } });
  await forecastTransform({ terminal: { smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|weather_forecast|*" } });
}

tests();