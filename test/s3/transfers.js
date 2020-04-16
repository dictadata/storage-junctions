/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: S3 transfers");

async function s3Upload() {
  logger.verbose("=== S3 uploads");

  logger.verbose('=== S3: csv_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    terminus: {
      smt: "csv|S3:dictadata.org/test/output/|csv_output.csv|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    }
  });

  logger.verbose('=== S3: csv_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminus: {
      smt: "csv|S3:dictadata.org/test/output/|csv_output.csv.gz|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    }
  });

  logger.verbose('=== S3: json_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminus: {
      smt: "json|S3:dictadata.org/test/output/|json_output.json|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    }
  });

  logger.verbose('=== S3: json_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "json|S3:dictadata.org/test/output/|json_output.json.gz|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    }
  });

}

async function s3Download() {
  logger.verbose("=== S3 downloads");

  logger.verbose('=== s3_output.csv');
  await transfer({
    origin: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv.gz|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    },
    terminus: {
      smt: "csv|./test/output/|s3_output.csv|*"
    }
  });

  logger.verbose('=== s3_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    },
    terminus: {
      smt: "csv|./test/output/|s3_output.csv.gz|*"
    }
  });

  logger.verbose('=== s3_output.json');
  await transfer({
    origin: {
      smt: "json|S3:dictadata.org/test/data/|foofile.json.gz|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    },
    terminus: {
      smt: "json|./test/output/|s3_output.json|*"
    }
  });

  logger.verbose('=== s3_output.json.gz');
  await transfer({
    origin: {
      smt: "json|S3:dictadata.org/test/data/|foofile.json|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    },
    terminus: {
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
