/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: rest encoding");

async function tests() {

  logger.info("=== rest getEncoding (forecast)");
  await getEncoding({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
        },
        auth: {
          //username: this.options.auth.username,
          //password: this.options.auth.password
        },
        params: {
          // querystring parameters
        },
        extract: {
          data: "periods",  // name of property in response.data than contains the desired object or array
          names: ""         // name of property in response.data containing an array of field names
          // if names is empty then data should be a json object or array of json objects
        }
      }
    },
    terminal: {
      output: './output/weather_forecast_encoding.json'
    }
  });

}

tests();
