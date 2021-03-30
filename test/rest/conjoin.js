/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: rest transfer");

async function testTransfer() {

  logger.verbose("=== conjoin weather forecast");
  if (await transfer({
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
      smt: "csv|./data/output/rest/|weather_forecast_conjoin.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await testTransfer()) return;
})();
