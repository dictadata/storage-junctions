/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../_getEncoding');
const putEncoding = require('../_putEncoding');
const logger = require('../../../lib/logger');

logger.info("=== Test: rest encoding");

async function tests() {

  logger.info("=== rest getEncoding (forecast)");
  await getEncoding({
    source: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage-node contact:drew@dictadata.org"
        },
        auth: {
          //username: this._options.auth.username,
          //password: this._options.auth.password
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
    OutputFile: './test/output/rest_forecast_encoding.json'
  });

}

tests();
