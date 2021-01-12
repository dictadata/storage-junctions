/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: S3 transfers");

async function s3Destination() {
  logger.verbose("=== S3 destination");

  logger.verbose('=== S3: csv_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "csv|S3:dictadata.org/test/output/|csv_output.csv|*",
      options: {
        csvHeader: true,
        "s3": {
          "aws_profile": ""
        }
      }
    }
  });

  logger.verbose('=== S3: csv_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "csv|S3:dictadata.org/test/output/|csv_output.csv.gz|*",
      options: {
        csvHeader: true,
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
    terminal: {
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
    terminal: {
      smt: "json|S3:dictadata.org/test/output/|json_output.json.gz|*",
      options: {
        "s3": {
          "aws_profile": ""
        }
      }
    }
  });

}

async function s3Source() {
  logger.verbose("=== S3 source");

  logger.verbose('=== s3_output.csv');
  await transfer({
    origin: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv.gz|*",
      options: {
        csvHeader: true,
        "s3": {
          "aws_profile": ""
        }
      }
    },
    terminal: {
      smt: "csv|./test/output/|s3_output.csv|*",
      options: {
        csvHeader: true
      }
    }
  });

  logger.verbose('=== s3_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv|*",
      options: {
        csvHeader: true,
        "s3": {
          "aws_profile": ""
        }
      }
    },
    terminal: {
      smt: "csv|./test/output/|s3_output.csv.gz|*",
      options: {
        csvHeader: true
      }
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
    terminal: {
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
    terminal: {
      smt: "json|./test/output/|s3_output.json.gz|*"
    }
  });

}

(async () => {
  await s3Source();
  await s3Destination();
  logger.verbose("Done.");
})();
