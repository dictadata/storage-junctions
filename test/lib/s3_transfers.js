/**
 * test/rest
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: s3");

async function s3Upload() {

  logger.verbose("=== upload");
  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*",
      options: {
      }
    },
    destination: {
      smt: "csv|S3:dictadata.org/subfolder|testfile.csv|*",
      options: {}
    }
  });

}

async function s3Download() {

  logger.verbose("=== download");
  await transfer({
    source: {
      smt: "csv|S3:dictadata.org/subfolder|testfile.csv|*",
      options: {
      }
    },
    destination: {
      smt: "csv|./test/output/|s3_output.csv|*",
      options: {}
    }
  });

}

async function tests() {
  await s3Upload();
  await s3Download();
  logger.verbose("Done.");
}

tests();
