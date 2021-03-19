/**
 * test/transport/retreive
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');


logger.info("=== Test: rest retrieve");

async function testRetrieve() {

  logger.verbose("=== Retrieve from remote Node");
  await retrieve({
    origin: {
      smt: "transport|https://localhost:8089/node/|storage|=*",
      options: {
        headers: {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
        },
        auth: {
          //username: this.options.auth.username,
          //password: this.options.auth.password
        },
        params: {
          // querystring parameters
        },
        extract: {
          data: "periods",  // name of property in response.data than contains the desired object or array
          names: ""         // name of property in response.data containing an array of field names
          // if names is empty then data should be a json object or array of json objects
        }
      }
    },
    terminal: {
      output: './output/rest/weather_forecast_retrieve.json'
    }
  });

}

async function tests() {
  await testRetrieve();
}

(async () => {
  await tests();
})();
