/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest encoding");

async function tests() {

  logger.info("=== rest getEncoding (forecast)");
  if (await getEncoding({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
        },
        //auth: "username:password",
        extract: {
          data: "periods",  // name of property in response.data than contains the desired object or array
          names: ""         // name of property in response.data containing an array of field names
          // if names is empty then data should be a json object or array of json objects
        }
      }
    },
    terminal: {
      output: './test/data/output/rest/weather_forecast_encoding.json'
    }
  }, false)) return 1;

}

(async () => {
  if (await tests()) return;
})();
