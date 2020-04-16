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
          "User-Agent": "@dictadata.org/storage-node contact:info@dictadata.org"
        },
        auth: {
          //username: this.options.auth.username,
          //password: this.options.auth.password
        },
        params: {
          // querystring parameters
        },
        reader: {
          extract: {
            encoding: "",  // name of property containing an array of field headers
            // empty encoding denotes data array contains json objects
            data: "periods"  // name of property for data array (objects or values)
          }
        }
      }
    },
    outputFile: './test/output/rest_forecast_encoding.json'
  });

}

tests();
