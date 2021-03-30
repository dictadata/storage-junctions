/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');


logger.info("=== Test: rest transfer");

async function testTransfer() {

  logger.verbose("=== Transfer Weather Service forecast");
  await transfer({
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
        extract: {
          data: "periods",  // name of property in response.data than contains the desired object or array
          names: ""         // name of property in response.data containing an array of field names
          // if names is empty then data should be a json object or array of json objects
        }
      }
    },
    terminal: {
      smt: "csv|./data/output/rest/|weather_forecast_transfer.csv|*",
      options: {
        header: true
      }
    }
  });

}

async function tests() {
  await testTransfer();
}

(async () => {
  await tests();
})();
