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
      smt: "*|http://localhost/data/dictadata.org/test/input/|foo*.json|*",
      options: {
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/data/output/http/list_1.json"
    }
  })) return 1;

  logger.info("=== IIS get list of encoding files (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "*",
        locus: "http://localhost/data/dictadata.org/test/input/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "enc*.json",
        recursive: true,
        http: {
          httpVersion: 1.1,
          headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': 'gzip, deflate',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
            'cache-control': "max-age=0"
          }
        }
      }
    },
    terminal: {
      output: "./test/data/output/http/list_2.json"
    }
  })) return 1;

}

async function testNGINX() {

  logger.info("=== NGINX get list of foo files - forEach");
  if (await list({
    origin: {
      smt: "*|https://cda.dictadata.org/data/dictadata.org/test/input/|foo*.json|*",
      options: {
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/data/output/http/list_3.json"
    }
  })) return 1;

  logger.info("=== NGINX get list of encoding files (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "*",
        locus: "https://cda.dictadata.org/data/dictadata.org/test/input/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "enc*.json",
        recursive: true,
        http: {
          httpVersion: 1.1,
          headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': 'gzip, deflate',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
            'cache-control': "max-age=0"
          }
        }
      }
    },
    terminal: {
      output: "./test/data/output/http/list_4.json"
    }
  })) return 1;

}

(async () => {
  if (await testIIS()) return;
  if (await testNGINX()) return;
})();
