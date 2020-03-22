/**
 * test/rest
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');


logger.info("=== Test: rest retrieve");

async function testRetrieve() {

  logger.verbose("=== Retrieve Weather Service forecast");
  await retrieve({
    source: {
      smt: "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage-node contact:drew@dictadata.org"
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
    }
  });

}

async function tests() {
  await testRetrieve();
}

tests();
