/**
 * test/http_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: HTTP list");

async function tests() {

  logger.info("=== list http directory OPTIONS");
  await list({
    origin: {
      smt: "shapes|https://sos.iowa.gov/shapefiles/|*|*",
      options: {
        url: 'https://sos.iowa.gov',
        path: '/shapefiles/',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate',
          'cache-control': 'max-age=0'          
        },
        recursive: false
      }
    },
    terminal: "./test/output/http_list_1.json"
  });

}

async function main() {
  await tests();
}

main();
