/**
 * test/rest
 */
"use strict";

const transfer = require('../_transfer');
const logger = require('../../../lib/logger');


logger.info("=== Test: rest transfer");

async function testTransfer() {

  logger.verbose("=== Transfer Weather Service forecast");
  await transfer({
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
            // empty denotes data array contains json objects
            data: "periods"  // name of property for data array (objects or values)
          }
        }
      }
    },
    destination: {
      smt: "csv|./test/output/|rest_forecast_output.csv|*"
    }
  });

}

async function tests() {
  await testTransfer();
}

tests();
