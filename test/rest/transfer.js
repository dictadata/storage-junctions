/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: rest transfer");

async function testTransfer() {

  logger.verbose("=== Transfer foodusage");
  if (await transfer({
    origin: {
      smt: "rest|https://api.panerabread.com/iboh/food-usage/v1/|franchiseFoodUsage|*",
      options: {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "@dictadata.org/storage contact:info@dictadata.org",
          "Authorization": "Bearer O36OT8ZG5z5zbXZ3mbtgJ6HeuwNi"
        },
        extract: {
          data: "rows",     // name of property in response.data than contains the desired object or array
          names: "headers"  // name of property in response.data containing an array of field names
          // if names is empty then data should be a json object or array of json objects
        }
      },
      pattern: {
        "companyCode": "PANSI001",
        "reportDate": "2021-04-20"
      }
    },
    terminal: {
      smt: "json|./data/output/rest/|foodusage_transfer.json|*"
    }
  })) return 1;

    logger.verbose("=== Transfer Weather Service forecast");
  if (await transfer({
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
      smt: "csv|./data/output/rest/|weather_forecast_transfer.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await testTransfer()) return;
})();
