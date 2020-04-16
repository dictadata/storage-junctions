/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  //logger.info("=== dull foo_transfer");
  //await dull({
  //  origin: {
  //    smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
  //  }
  //});

  logger.info("=== csv => elasticsearch");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminus: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    }
  });

  logger.info("=== json => elasticsearch");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_j|*"
    }
  });

  logger.info("=== elasticsearch => elasticsearch");
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    terminus: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
    }
  });

  logger.info("=== elasticsearch => csv");
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
    },
    terminus: {
      smt: "csv|./test/output/|elastic_output.csv|*",
      options: {
        append: false
      }
    }
  });

  logger.info("=== elasticsearch => json");
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_j|*"
    },
    terminus: {
      smt: "json|./test/output/|elastic_output.json|*",
      options: {
        append: false
      }
    }
  });

}

tests();
