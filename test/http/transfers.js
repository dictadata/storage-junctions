/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: http transfers");

async function httpDownload() {
  logger.verbose("=== http downloads");

  logger.verbose('=== http_output.csv');
  await transfer({
    origin: {
      smt: "csv|http://localhost/test/data/|foofile.csv.gz|*",
      options: {
        http: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminal: {
      smt: "csv|./test/output/|http_output.csv|*"
    }
  });

  logger.verbose('=== http_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|http://localhost/test/data/|foofile.csv|*",
      options: {
        http: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminal: {
      smt: "csv|./test/output/|http_output.csv.gz|*"
    }
  });

  logger.verbose('=== http_output.json');
  await transfer({
    origin: {
      smt: "json|http://localhost/test/data/|foofile.json.gz|*",
      options: {
        http: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminal: {
      smt: "json|./test/output/|http_output.json|*"
    }
  });

  logger.verbose('=== http_output.json.gz');
  await transfer({
    origin: {
      smt: "json|http://localhost/test/data/|foofile.json|*",
      options: {
        http: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminal: {
      smt: "json|./test/output/|http_output.json.gz|*"
    }
  });

}

async function tests() {
  await httpDownload();
  logger.verbose("Done.");
}

tests();
