/**
 * test/http/transfers
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');


logger.info("=== Test: http data transfers");

async function test_transfers() {
  let compareValues = 2;

  logger.verbose('=== http json to local csv');
  if (await transfer({
    origin: {
      smt: "json|http://dev.dictadata.net/dictadata/test/data/input/|foofile.json|*",
    },
    terminal: {
      smt: "csv|./test/_data/output/http/|foofile.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/http/foofile.csv"
    }
  }, compareValues)) return 1;

  logger.verbose('=== http csv to local json');
  if (await transfer({
    origin: {
      smt: "csv|http://dev.dictadata.net/dictadata/test/data/input/|foofile.csv|*",
      options: {
        hasHeader: true,
        encoding: "./test/_data/input/engrams/foo_schema.engram.json"
      }
    },
    terminal: {
      smt: "json|./test/_data/output/http/|foofile.json|*",
      output: "./test/_data/output/http/foofile.json"
    }
  }, compareValues)) return 1;

}

async function test_uncompress() {
  let compareValues = 2;

  logger.verbose('=== http .gz to local json');
  if (await transfer({
    origin: {
      smt: "json|http://dev.dictadata.net/dictadata/test/data/input/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./test/_data/output/http/|foofile_gunzip.json|*",
      output: "./test/_data/output/http/foofile_gunzip.json"
    }
  }, compareValues)) return 1;

  logger.verbose('=== http .gz to local csv');
  if (await transfer({
    origin: {
      smt: "csv|http://dev.dictadata.net/dictadata/test/data/input/|foofile.csv.gz|*",
      options: {
        hasHeader: true,
        encoding: "./test/_data/input/engrams/foo_schema.engram.json"
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/http/|foofile_gunzip.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/http/foofile_gunzip.csv"
    }
  }, compareValues)) return 1;

}

async function test_census_data() {
  let compareValues = 1;

  logger.verbose('=== census data to local json');
  if (await transfer({
    origin: {
      smt: "json|https://api.census.gov/data/2020/dec/|pl|*",
      options: {
        params: {
          "get": "NAME,P1_001N,P3_001N",
          "for": "state:*"
        },
        hasHeader: true
      }
    },
    terminal: {
      smt: "json|./test/_data/output/http/|census_transfer_1.json|*",
      output: "./test/_data/output/http/census_transfer_1.json"
    }
  }, compareValues)) return 1;

}

async function test_weather_data() {
  let compareValues = 1;

  logger.verbose("=== transfer Weather Service forecast");
  if (await transfer({
    origin: {
      smt: "json|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
        pick: "properties.periods"
      }
    },
    terminal: {
      smt: "json|./test/_data/output/http/|weather_forecast_transfer.json|*",
      output: "./test/_data/output/http/weather_forecast_transfer.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await test_transfers()) return 1;
  if (await test_uncompress()) return 1;
  if (await test_census_data()) return 1;
  if (await test_weather_data()) return 1;
})();
