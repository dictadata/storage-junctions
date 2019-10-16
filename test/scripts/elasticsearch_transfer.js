/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== csv => elasticsearch");
  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*"
    }
  });

  logger.info("=== elasticsearch => elasticsearch");
  await transfer({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*"
    },
    destination: {
      smt: "elasticsearch|http://localhost:9200|test_transfer|*"
    }
  });

  logger.info("=== elasticsearch => csv");
  await transfer({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_transfer|*"
    },
    destination: {
      smt: "csv|./test/output/|elastic_output.csv|*"
    }
  });

}

tests();
