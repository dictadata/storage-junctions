/**
 * test/http_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: HTTP list");

async function tests() {

  logger.info("=== list http directory (forEach)");
  await list({
    origin: {
      smt: "shapes|https://sos.iowa.gov/shapefiles/|*|*",
      options: {
        http: {
        },
        recursive: false,
        forEach: (name) => {
          logger.info("- " + name);
        }
      }
    },
    terminal: "./test/output/http_list_1.json"
  });

  logger.info("=== list http directory (recursive)");
  await list({
    origin: {
      smt: {
        model: "shapes",
        locus: "https://sos.iowa.gov/shapefiles/",
        schema: "*",
        key: "*"
      },
      options: {
        http: {
        },
        schema: "foofile_*.json",
        recursive: true
      }
    },
    terminal: "./test/output/http_list_2.json"
  });

}

async function main() {
  await tests();
}

main();
