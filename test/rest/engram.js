/**
 * test/rest/engram
 */
"use strict";

const getEngram = require('../lib/_getEngram');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest encoding");

async function tests() {

  logger.info("=== rest getEngram (forecast)");
  if (await getEngram({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.net/storage contact:info@dictadata.net"
          },
          //auth: "username:password"
        },
        retries: 1,
        extract: "periods"
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
