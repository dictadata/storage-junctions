/**
 * test/rest/transfer
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest transfer");

var compareValues = 1;

async function transfer_1() {

  logger.verbose("=== transfer Weather Service forecast");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
        extract: "properties.periods"
      }
    },
    terminal: {
      smt: "json|./test/data/output/rest/|weather_forecast_transfer_1.json|*",
      output: "./test/data/output/rest/weather_forecast_transfer_1.json"
    }
  }, compareValues)) return 1;

}

async function transfer_2() {

  logger.verbose("=== transfer Weather Service forecast");
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
    terminal: {
      smt: "json|./test/data/output/rest/|weather_forecast_transfer_2.json|*",
      output: "./test/data/output/rest/weather_forecast_transfer_2.json"
    }
  }, compareValues)) return 1;

}

async function transfer_3() {

  logger.verbose("=== transfer census population data");
  if (await transfer({
    origin: {
      smt: "rest|https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N,P3_001N&for=county:*&in=state:19||*",
      options: {
        array_of_arrays: true
      }
    },
    terminal: {
      smt: "json|./test/data/output/rest/|census_population_transfer_3.json|*",
      output: "./test/data/output/rest/census_population_transfer_3.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await transfer_1()) return;
  if (await transfer_2()) return;
  if (await transfer_3()) return;
})();
