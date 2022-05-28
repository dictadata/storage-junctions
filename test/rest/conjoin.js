/**
 * test/rest/conjoin
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest conjoin");

async function testConjoin() {
  let compareValues = 1;

  logger.verbose("=== conjoin weather forecast");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/points/${latitude},${longitude}||*",
      options: {
        urlParams: {
          latitude: 39.7456,
          longitude: -97.0892
        },
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
          }
        }
      },
      pattern: {
        fields: [ "cwa", "gridX", "gridY" ]
      }
    },
    transform: {
      conjoin: {
        smt: "rest|https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast||*",
        options: {
          http: {
            headers: {
              "Accept": "application/ld+json",
              "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
            }
          },
          extract: "periods"
        }
      }
    },
    terminal: {
      smt: "json|./data/output/rest/|weather_forecast_conjoin.json|*",
      output: "./data/output/rest/weather_forecast_conjoin.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await testConjoin()) return;
})();
