/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: csv transfers");

async function tests() {

  logger.verbose('=== csv > csv_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/output/|csv_output.csv|*",
      options: {
        csvHeader: true
      }
    }
  });

  logger.verbose('=== csv > csv_output_noheader.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/output/|csv_output_noheader.csv|*"
    }
  });

  logger.verbose('=== csv > csv_output.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "json|./test/output/|csv_output.json|*"
    }
  });

  logger.verbose('=== timeseries.csv > csv_timeseries.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|timeseries.csv|*",
      options: {
        csvHeader: false
      },
      encoding: {
        "time": "date",
        "temp": "number"
      }
    },
    terminal: {
      smt: "json|./test/output/|csv_timeseries.json|*"
    }
  });

}

(async () => {
  await tests();
})();
