/**
 * test/rest/conjoin
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: rest conjoin");

async function testConjoin() {

  logger.verbose("=== conjoin weather forecast");
  if (await transfer({
    origin: {
      smt: "rest|https://api.weather.gov/points/39.7456,-97.0892||=*",
      options: {
        http: {
          headers: {
            "Accept": "application/ld+json",
            "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
          }
        },
        fields: ["cwa","gridX","gridY"]
      }
    },
    transform: {
      conjoin: {
        smt: "rest|https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/|forecast|=*",
        options: {
          http: {
            headers: {
              "Accept": "application/ld+json",
              "User-Agent": "@dictadata.org/storage contact:info@dictadata.org"
            }
          },
          extract: "periods"
        }
      }
    },
    terminal: {
      smt: "json|./test/data/output/rest/|weather_forecast_conjoin.json|*",
      options: {}
    }
  })) return 1;

}

(async () => {
  if (await testConjoin()) return;
})();
