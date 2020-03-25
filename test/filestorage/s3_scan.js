/**
 * test/s3_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: S3 list");

async function tests() {

  logger.info("=== list S3 bucket (forEach)");
  await list({
    source: {
      smt: "csv|S3:dictadata.org/test/output/|*.csv|*",
      options: {
        list: {
          recursive: false,
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
      smt: {
        model: "json",
        locus: "S3:dictadata.org/test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        s3: {
          aws_profile: ""
        },
        list: {
          recursive: true
        }
      }
    }
  });

}

async function main() {
  await tests();
}

main();
