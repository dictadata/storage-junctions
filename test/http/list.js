/**
 * test/http/list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: HTTP list");

async function testIIS() {

  logger.info("=== list IIS http directory - forEach");
  if (await list({
    origin: {
      smt: "json|http://localhost/data/dictadata.org/test/input/|foo*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        },
        http: 1.1
      }
    },
    terminal: {
      output: "./test/data/output/http/list_1.json"
    }
  })) return 1;

  logger.info("=== list IIS http directory - recursive");
  if (await list({
    origin: {
      smt: "json|http://localhost/data/dictadata.org/test/input/|*.json|*",
      options: {
        schema: "enc*.json",
        recursive: true,
        http: 1.1
      }
    },
    terminal: {
      output: "./test/data/output/http/list_2.json"
    }
  })) return 1;

}

async function testNGINX() {

  logger.info("=== list NGINX http directory - forEach");
  if (await list({
    origin: {
      smt: "json|http://ec2-3-208-205-6.compute-1.amazonaws.com/data/dictadata.org/test/input/|foo*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        },
        http: 1.1
      }
    },
    terminal: {
      output: "./test/data/output/http/list_3.json"
    }
  })) return 1;

  logger.info("=== list NGINX http directory - recursive");
  if (await list({
    origin: {
      smt: "json|http://ec2-3-208-205-6.compute-1.amazonaws.com/data/dictadata.org/test/input/|*.json|*",
      options: {
        schema: "enc*.json",
        recursive: true,
        http: 1.1
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
