/**
 * test/rest
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: s3");

async function s3Download() {

  logger.verbose("=== download");
  await transfer({
    source: {
      smt: "csv|S3:icbrewlab.com|iowa-city-brewlab_20151001-20151231-transactions.csv|*",
      options: {
      }
    },
    destination: {
      smt: "csv|./test/output/|iowa-city-brewlab_20151001-20151231-transactions.csv|*",
      options: {}
    }
  });

}

async function s3Upload() {

  logger.verbose("=== upload");
  await transfer({
    source: {
      smt: "csv|./test/output/|iowa-city-brewlab_20151001-20151231-transactions.csv|*",
      options: {
      }
    },
    destination: {
      smt: "csv|S3:icbrewlab.com|copy-iowa-city-brewlab_20151001-20151231-transactions.csv|*",
      options: {}
    }
  });

}

async function tests() {
  //await s3Download();
  await s3Upload();
  logger.verbose("Done.");
}

tests();
