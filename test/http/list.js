/**
 * test/http/list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: HTTP list");

async function testIIS() {

  logger.info("=== IIS get list of foo files (forEach)");
  if (await list({
    origin: {
      smt: "*|http://dev.dictadata.org/data/dictadata.org/test/input/|foofile*.json|*",
      options: {
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./data/output/http/IIS/list_1.json"
    }
  })) return 1;

  logger.info("=== IIS get list of encoding files (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "*",
        locus: "http://dev.dictadata.org/data/dictadata.org/test/input/",
        schema: "*.encoding.json",
        key: "*"
      },
      options: {
        recursive: true,
        http: {
          httpVersion: 1.1,
          headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': "gzip, deflate, br;q=0.1",
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
            'cache-control': "max-age=0"
          }
        }
      }
    },
    terminal: {
      output: "./data/output/http/IIS/list_2.json"
    }
  })) return 1;

}

async function testNGINX() {

  logger.info("=== NGINX get list of foo files - forEach");
  if (await list({
    origin: {
      smt: "*|https://api.dictadata.org/data/dictadata.org/test/input/|foofile*.json|*",
      options: {
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./data/output/http/NGINX/list_1.json"
    }
  })) return 1;

  logger.info("=== NGINX get list of encoding files (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "*",
        locus: "https://api.dictadata.org/data/dictadata.org/test/input/",
        schema: "*.encoding.json",
        key: "*"
      },
      options: {
        recursive: true,
        http: {
          httpVersion: 1.1,
          headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': "gzip, deflate, br;q=0.1",
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
            'cache-control': "max-age=0"
          }
        }
      }
    },
    terminal: {
      output: "./data/output/http/NGINX/list_2.json"
    }
  })) return 1;

}

async function testSOS() {

  logger.info("=== get list of shapefiles from sos.iowa.gov");
  if (await list({
    origin: {
      smt: "*|https://sos.iowa.gov/shapefiles/|*.zip|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/http/list_sos_shapefiles.json"
    }
  })) return 1;

}

(async () => {
  if (await testIIS()) return;
  if (await testNGINX()) return;
  if (await testSOS()) return;
})();
