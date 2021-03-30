/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: csv transfers");

async function tests() {
/*
  logger.verbose('=== csv > csv_output.csv');
  await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/csv/|output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== csv > csv_output_noheader.csv');
  await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/csv/|output_noheader.csv|*"
    }
  });

  logger.verbose('=== csv > csv_output.json');
  await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./data/output/csv/|output.json|*"
    }
  });

  logger.verbose('=== timeseries.csv > csv_timeseries.json');
  await transfer({
    origin: {
      smt: "csv|./data/test/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          "time": "date",
          "temp": "number"
        }
      },
    },
    terminal: {
      smt: "json|./data/output/csv/|timeseries.json|*"
    }
  });
*/
  logger.verbose('=== fueltrim.csv > csv_fueltrim.json');
  await transfer({
    origin: {
      smt: "csv|./data/test/|fueltrim.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./data/output/csv/|fueltrim.json|*"
    }
  });

}

(async () => {
  await tests();
})();
