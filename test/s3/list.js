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
      smt: "json|S3:dictadata.org/test/data/|*.json|*",
      options: {
        list: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    },
    outputFile: "./test/output/s3_list_1.json"
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
          aws_profile: "dictadata"
        },
        list: {
          schema: "foofile_*.json",
          recursive: true
        }
      }
    },
    outputFile: "./test/output/s3_list_2.json"
  });

}

async function main() {
  await tests();
}

main();
