/**
 * test/list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: CSV list");

async function tests() {

  logger.info("=== list local filesystem");
  await list({
    source: {
      smt: "csv|./test/|*.csv|*",
      options: {
        list: {
          recursive: true,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    }
  });

  logger.info("=== list S3 bucket (recursive)");
  await list({
    source: {
      smt: "csv|S3:dictadata.org/test/output/|*.csv|*",
      options: {
        list: {
          recursive: false
        }
      }
    }
  });

  logger.info("=== list S3 bucket");
  await list({
    source: {
      smt: {
        model: "csv",
        locus: "S3:dictadata.org/test/",
        schema: "*.csv.*",
        key: "*",
        aws_profile: ""
      },
      options: {

      }
    },
    list: {
      recursive: true
    }
  });

}

async function main() {
  await tests();
}

main();
