/**
 * test/rest/engram
 */
"use strict";

const getEngram = require('../lib/_getEngram');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest encoding");

async function tests() {

  logger.info("=== rest getEngram (points)");
  if (await getEngram({
    origin: {
      smt: "rest|https://api.weather.gov/points/${latitude},${longitude}||*",
      options: {
        urlReplace: {
          latitude: 39.7456,
          longitude: -97.0892
        },
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.net/storage contact:info@dictadata.net"
          }
        },
        retries: 1,
        pattern: {
          fields: [ "cwa", "gridX", "gridY" ]
        }
      }
    },
    terminal: {
      output: './test/data/output/rest/weather_points.engram.json'
    }
  }, 1)) return 1;


  logger.info("=== rest getEngram (forecast)");
  if (await getEngram({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
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
      output: './test/data/output/rest/weather_forecast.engram.json'
    }
  }, 1)) return 1;

}

(async () => {
  if (await tests()) return;
})();
