/**
 * test/http/list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: HTTP list");

async function testIIS() {

  logger.info("=== list http directory - forEach");
  if (await list({
    origin: {
      smt: "json|http://localhost/data/test/|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        },
        http: 1.1
      }
    },
    terminal: {
      output: "./data/output/http/list_1.json"
    }
  })) return 1;

  logger.info("=== list http directory - recursive");
  if (await list({
    origin: {
      smt: "json|http://localhost/data/|*.json|*",
      options: {
        recursive: true,
        http: 1.1
      }
    },
    terminal: {
      output: "./data/output/http/list_2.json"
    }
  })) return 1;

}

async function testNGINX() {

  logger.info("=== list http directory - forEach");
  if (await list({
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
      output: "./data/output/http/list_3.json"
    }
  })) return 1;

  logger.info("=== list http directory - recursive");
  if (await list({
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
      output: "./data/output/http/list_4.json"
    }
  })) return 1;

}

(async () => {
  if (await testIIS()) return;
  if (await testNGINX()) return;
})();
