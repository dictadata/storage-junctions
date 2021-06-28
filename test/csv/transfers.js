/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: csv transfers");

async function tests() {

  logger.verbose('=== csv > csv_output.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== csv > csv_output_noheader.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|output_noheader.csv|*"
    }
  })) return 1;

  logger.verbose('=== csv > csv_output.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./test/data/output/csv/|output.json|*"
    }
  })) return 1;

  logger.verbose('=== timeseries.csv > csv_timeseries.json');
  if (await transfer({
    origin: {
      smt: "csv|/var/data/dictadata.org/test/input/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          "time": "date",
          "temp": "number"
        }
      },
    },
    terminal: {
      smt: "json|./test/data/output/csv/|timeseries.json|*"
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
