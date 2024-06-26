/**
 * test/rest/conjoin
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: rest conjoin");

async function testConjoin() {
  let compareValues = 1;

  logger.verbose("=== conjoin weather forecast");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/points/${latitude},${longitude}||*",
      options: {
        urlReplace: {
          latitude: 39.7456,
          longitude: -97.0892
        },
        encoding: "./test/_data/input/engrams/weather_points.engram.json",
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.net/storage contact:info@dictadata.net"
          }
        },
        retries: 1
      },
      pattern: {
        fields: [ "cwa", "gridX", "gridY" ]
      }
    },
    transforms: [
      {
        transform: "conjoin",
        smt: "rest|https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast||*",
        options: {
          encoding: "./test/_data/input/engrams/weather_forecast.engram.json",
          http: {
            headers: {
              "Accept": "application/ld+json",
              "User-Agent": "@dictadata.net/storage contact:info@dictadata.net"
            }
          },
          retries: 1,
          pick: "periods"
        }
      }
    ],
    terminal: {
      smt: "json|./test/_data/output/rest/|weather_forecast_conjoin.json|*",
      options: {
        encoding: "./test/_data/input/engrams/weather_forecast.engram.json"
      },
      output: "./test/_data/output/rest/weather_forecast_conjoin.json"
    }
  }, compareValues)) return 1;

}

(async () => {
  if (await testConjoin()) return;
})();
