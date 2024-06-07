/**
 * test/rest/transfer
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('@dictadata/lib');
const { stringBreakpoints } = require('../../storage/types');

logger.info("=== Test: rest transfer");

async function transfer_weather() {
  let compareValues = 1;

  logger.verbose("=== transfer Weather Service forecast");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
        encoding: "./test/data/input/engrams/weather_forecast.engram.json",
        retries: 1,
        pick: "properties.periods"
      }
    },
    terminal: {
      smt: "json|./test/data/output/rest/|weather_forecast_transfer_1.json|*",
      options: {
        encoding: "./test/data/input/engrams/weather_forecast.engram.json"
      },
      output: "./test/data/output/rest/weather_forecast_transfer_1.json"
    }
  }, compareValues)) return 1;

  logger.verbose("=== transfer Weather Service forecast w/ params");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/${office}/${gridX},${gridY}/|forecast|*",
      options: {
        urlReplace: {
          "office": "DVN",
          "gridX": 34,
          "gridY": 71
        },
        encoding: "./test/data/input/engrams/weather_forecast.engram.json",
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
    terminal: {
      smt: "json|./test/data/output/rest/|weather_forecast_transfer_2.json|*",
      options: {
        encoding: "./test/data/input/engrams/weather_forecast.engram.json"
      },
      output: "./test/data/output/rest/weather_forecast_transfer_2.json"
    }
  }, compareValues)) return 1;

}

async function transfer_census() {
  let compareValues = 1;

  logger.verbose("=== transfer census population data");
  if (await transfer({
    origin: {
      smt: "rest|https://api.census.gov/data/2020/dec/pl?get=NAME,P1_001N,P3_001N&for=county:*&in=state:19||*",
      options: {
        header: true,
        retries: 1,
        encoding: {
          fields: {
            "NAME": "string",
            "P1_001N": "number",
            "P3_001N": "number",
            "state": "keyword",
            "county": "keyword"
          }
        }
      }
    },
    terminal: {
      smt: "json|./test/data/output/rest/|census_population_transfer_1.json|*",
      output: "./test/data/output/rest/census_population_transfer_1.json"
    }
  }, compareValues)) return 1;

  logger.verbose('=== census data with querystring');
  if (await transfer({
    origin: {
      smt: "rest|https://api.census.gov/data/2020/|dec/pl|*",
      options: {
        params: {
          "get": "NAME,P1_001N,P3_001N",
          "for": "county:*",
          "in": "state:19"
        },
        header: true,
        retries: 1,
        encoding: {
          fields: {
            "NAME": "string",
            "P1_001N": "number",
            "P3_001N": "number",
            "state": "keyword",
            "county": "keyword"
          }
        }
      }
    },
    terminal: {
      smt: "json|./test/data/output/rest/|census_population_transfer_2.json|*",
      output: "./test/data/output/rest/census_population_transfer_2.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await transfer_weather()) return;
  if (await transfer_census()) return;
})();
