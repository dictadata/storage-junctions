/**
 * test/rest/encoding
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest encoding");

async function tests() {

  logger.info("=== rest getEncoding (forecast)");
  if (await getEncoding({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|*",
      options: {
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
          },
          //auth: "username:password"
        },
        extract: "periods"
      }
    },
    terminal: {
      output: './test/data/output/rest/weather_forecast.encoding.json'
    }
  }, 1)) return 1;

}

(async () => {
  if (await tests()) return;
})();
