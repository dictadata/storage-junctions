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
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "csv|S3:dictadata.org/test/output/|testfile.csv|*"
    }
  });

  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "csv|S3:dictadata.org/test/output/|testfile.csv.gz|*"
    }
  });

  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|S3:dictadata.org/test/output/|testfile.json.gz|*"
    }
  });

}

async function s3Download() {
  logger.verbose("=== download");

  await transfer({
    source: {
      smt: "csv|S3:dictadata.org/test/data/|testfile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|s3_output.csv.gz|*"
    }
  });

  await transfer({
    source: {
      smt: "csv|S3:dictadata.org/test/data/|testfile.csv.gz|*"
    },
    destination: {
      smt: "csv|./test/output/|s3_output.csv|*"
    }
  });

}

async function tests() {
  await s3Upload();
  await s3Download();
  logger.verbose("Done.");
}

tests();
