/**
 * test/rest
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: S3 transfers");

async function s3Upload() {
  logger.verbose("=== S3 uploads");

  logger.verbose('>>> S3: output/csv_output.csv');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    destination: {
      smt: "csv|S3:dictadata.org/test/output/|csv_output.csv|*"
    }
  });

  logger.verbose('>>> S3: output/csv_output.csv.gz');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "csv|S3:dictadata.org/test/output/|csv_output.csv.gz|*"
    }
  });

  logger.verbose('>>> S3: output/json_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    destination: {
      smt: "json|S3:dictadata.org/test/output/|json_output.json|*"
    }
  });

  logger.verbose('>>> S3: output/json_output.json.gz');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "json|S3:dictadata.org/test/output/|json_output.json.gz|*"
    }
  });

}

async function s3Download() {
  logger.verbose("=== S3 downloads");

  logger.verbose('<<< S3: output/s3_output.csv');
  await transfer({
    source: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv.gz|*"
    },
    destination: {
      smt: "csv|./test/output/|s3_output.csv|*"
    }
  });

  logger.verbose('<<< S3: output/s3_output.csv.gz');
  await transfer({
    source: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|s3_output.csv.gz|*"
    }
  });

  logger.verbose('<<< S3: output/s3_output.json');
  await transfer({
    source: {
      smt: "json|S3:dictadata.org/test/data/|foofile.json.gz|*"
    },
    destination: {
      smt: "json|./test/output/|s3_output.json|*"
    }
  });

  logger.verbose('<<< S3: output/s3_output.json.gz');
  await transfer({
    source: {
      smt: "json|S3:dictadata.org/test/data/|foofile.json|*"
    },
    destination: {
      smt: "json|./test/output/|s3_output.json.gz|*"
    }
  });

}

async function tests() {
  await s3Upload();
  await s3Download();
  logger.verbose("Done.");
}

tests();
