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
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    }
  });

  logger.info("=== json => elasticsearch");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_j|*"
    }
  });

  logger.info("=== json 01 => elasticsearch");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_01|*"
    }
  });

  logger.info("=== json 02 => elasticsearch");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_02|*"
    }
  });

  logger.info("=== elasticsearch => elasticsearch");
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
    }
  });

  logger.info("=== elasticsearch => csv");
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./output/elastic/|output.csv|*",
      options: {
        header: true,
        append: false
      }
    }
  });

  logger.info("=== elasticsearch => json");
  await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_j|*"
    },
    terminal: {
      smt: "json|./output/elastic/|output.json|*",
      options: {
        append: false
      }
    }
  });

}

(async () => {
  await tests();
})();
