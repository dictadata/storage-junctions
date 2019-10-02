/**
 * test/rest
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: rest");

async function tests() {

  logger.verbose("Weather Service forecast");
  transfer({
    src_smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
    src_options: {
      headers: {
        "Accept": "application/ld+json",
        "User-Agent": "@dicta.io/storage-node contact:drew@dicta.io"
      },
      auth: {
        //username: this._options.auth.username,
        //password: this._options.auth.password
      },
      params: {
        // querystring parameters
      },
      dataEncoding: "",  // constructs array contains objects i.e. with property names
      //dataEncoding: "somearray",  // name of property for field names
      dataConstructs: "periods"  // name of property for constructs array
    },
    dst_smt: "csv|./test/output/|forecast_output.csv|*"
  });

}

tests();
