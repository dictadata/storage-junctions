/**
 * test/rest/retrieve
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('../../storage/utils');


logger.info("=== Test: rest retrieve");

async function retrieve_1() {

  logger.verbose("=== retrieve Weather Service forecast");
  if (await retrieve({
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
      output: './test/data/output/rest/weather_forecast_retrieve.json'
    }
  }, 1)) return 1;

}

async function retrieve_2() {

  logger.verbose("=== retrieve state census population");
  if (await retrieve({
    origin: {
      smt: "rest|https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N,P3_001N&for=state:*||*",
      options: {
        array_of_arrays: true
      }
    },
    terminal: {
      output: './test/data/output/rest/census_population_retrieve.json'
    }
  }, 1)) return 1;

}

(async () => {
  if (await retrieve_1()) return;
  if (await retrieve_2()) return;
})();
