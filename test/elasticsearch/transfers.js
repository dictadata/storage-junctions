/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  //logger.info("=== dull foo_transfer");
  //await dull({
  //  source: {
  //    smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
  //  }
  //});

  logger.info("=== csv => elasticsearch");
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    }
  });

  logger.info("=== elasticsearch => elasticsearch");
  await transfer({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    destination: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
    }
  });

  logger.info("=== elasticsearch => csv");
  await transfer({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
    },
    destination: {
      smt: "csv|./test/output/|elastic_output.csv|*",
      options: {
        append: false
      }
    }
  });

}

tests();
