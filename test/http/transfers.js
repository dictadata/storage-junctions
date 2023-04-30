/**
 * test/http/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: http data transfers");

async function test_transfers() {
  let compareValues = 2;

  logger.verbose('=== http json to local csv');
  if (await transfer({
    origin: {
      smt: "json|http://dev.dictadata.net/data/dictadata.net/data/input/|foofile.json|*",
    },
    terminal: {
      smt: "csv|./data/output/http/|foofile.csv|*",
      options: {
        header: true
      },
      output: "./data/output/http/foofile.csv"
    }
  }, compareValues)) return 1;

  logger.verbose('=== http csv to local json');
  if (await transfer({
    origin: {
      smt: "csv|http://dev.dictadata.net/data/dictadata.net/data/input/|foofile.csv|*",
      options: {
        header: true,
        encoding: "./data/input/encodings/foo_schema.encoding.json"
      }
    },
    terminal: {
      smt: "json|./data/output/http/|foofile.json|*",
      output: "./data/output/http/foofile.json"
    }
  }, compareValues)) return 1;

}

async function test_uncompress() {
  let compareValues = 2;

  logger.verbose('=== http .gz to local json');
  if (await transfer({
    origin: {
      smt: "json|http://dev.dictadata.net/data/dictadata.net/data/input/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./data/output/http/|foofile_gunzip.json|*",
      output: "./data/output/http/foofile_gunzip.json"
    }
  }, compareValues)) return 1;

  logger.verbose('=== http .gz to local csv');
  if (await transfer({
    origin: {
      smt: "csv|http://dev.dictadata.net/data/dictadata.net/data/input/|foofile.csv.gz|*"
    },
    terminal: {
      smt: "csv|./data/output/http/|foofile_gunzip.csv|*",
      options: {
        header: true
      },
      output: "./data/output/http/foofile_gunzip.csv"
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
        header: true
      }
    },
    terminal: {
      smt: "json|./data/output/http/|census_transfer_1.json|*",
      output: "./data/output/http/census_transfer_1.json"
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
        extract: "properties.periods"
      }
    },
    terminal: {
      smt: "json|./data/output/http/|weather_forecast_transfer.json|*",
      output: "./data/output/http/weather_forecast_transfer.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await test_transfers()) return 1;
  if (await test_uncompress()) return 1;
  if (await test_census_data()) return 1;
  if (await test_weather_data()) return 1;
})();
