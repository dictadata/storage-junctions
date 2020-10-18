/**
 * test/http/list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: HTTP list");

async function testIIS() {

  logger.info("=== list http directory - forEach");
  await list({
    origin: {
      smt: "json|http://localhost/test/data/|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        },
        http: 1.1
      }
    },
    terminal: {
      output: "./test/output/http_list_1.json"
    }
  });

  logger.info("=== list http directory - recursive");
  await list({
    origin: {
      smt: "json|http://localhost/test/|*.json|*",
      options: {
        recursive: true,
        http: 1.1
      }
    },
    terminal: {
      output: "./test/output/http_list_2.json"
    }
  });

}

async function testNGINX() {

  logger.info("=== list http directory - forEach");
  await list({
    origin: {
      smt: "shp|http://ec2-3-208-205-6.compute-1.amazonaws.com/shapefiles/United States/Iowa/Iowa City/|*.shp|*",
      options: {
        origin: 'http://ec2-3-208-205-6.compute-1.amazonaws.com',
        dirname: '/shapefiles/United States/Iowa/Iowa City/',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate',
          'cache-control': 'max-age=0'
        },
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        },
        http: 1.1
      }
    },
    terminal: {
      output: "./test/output/http_list_3.json"
    }
  });

  logger.info("=== list http directory - recursive");
  await list({
    origin: {
      smt: "shp|http://ec2-3-208-205-6.compute-1.amazonaws.com/shapefiles/|*|*",
      options: {
        origin: 'http://ec2-3-208-205-6.compute-1.amazonaws.com',
        dirname: '/shapefiles/',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate',
          'cache-control': 'max-age=0'
        },
        recursive: true,
        http: 1.1
      }
    },
    terminal: {
      output: "./test/output/http_list_4.json"
    }
  });

}

(async () => {
  await testIIS();
  await testNGINX();
})();
