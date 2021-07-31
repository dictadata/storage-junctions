/**
 * test/rest/transfer
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest transfer");

async function testTransfer() {

  logger.verbose("=== Transfer Weather Service forecast");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
          }
        },
        //auth: "username:password",
        extract: "periods"
      }
    },
    terminal: {
      smt: "csv|./test/data/output/rest/|weather_forecast_transfer.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await testTransfer()) return;
})();
