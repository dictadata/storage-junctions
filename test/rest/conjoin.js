/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: rest transfer");

async function testTransfer() {

  logger.verbose("=== conjoin weather forecast");
  await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/points/39.7456,-97.0892||=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
        },
        fields: ["cwa","gridX","gridY"]
      }
    },
    transforms: {
      conjoin: {
        smt: "rest|https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/|forecast|=*",
        options: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
          },
          extract: {
            data: "periods",  // name of property in response.data than contains the desired object or array
            names: ""         // name of property in response.data containing an array of field names
            // if names is empty then data should be a json object or array of json objects
          }
        }
      }
    },
    terminal: {
      smt: "csv|./test/output/|weather_forecast_conjoin.csv|*",
      options: {
        csvHeader: true
      }
    }
  });

}

async function tests() {
  await testTransfer();
}

tests();
