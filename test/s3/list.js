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
    origin: {
      smt: "json|S3:dictadata.org/test/data/|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/output/s3_list_1.json"
    }
  });

  logger.info("=== list S3 bucket (recursive)");
  await list({
    origin: {
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
        schema: "foofile_*.json",
        recursive: true
      }
    },
    terminal: {
      output: "./test/output/s3_list_2.json"
    }
  });

}

async function main() {
  await tests();
}

main();
