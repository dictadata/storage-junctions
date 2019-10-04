/**
 * test/rest
 */
"use strict";

const retrieve = require('./_retrieve');
const transfer = require('./_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: rest");

async function testRetrieve() {

  logger.verbose("=== Retrieve Weather Service forecast");
  await retrieve({
    source: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
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
      }
    }
  });

}

async function testTransfer() {

  logger.verbose("=== Transfer Weather Service forecast");
  await transfer({
    source: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
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
      }
    },
    destination: {
      smt: "csv|./test/output/|forecast_output.csv|*",
      options: {}
    }
  });

}

async function tests() {
  await testRetrieve();
  await testTransfer();
}

tests();
