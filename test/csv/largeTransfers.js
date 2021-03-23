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
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/csv/|output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== csv > csv_output_noheader.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/csv/|output_noheader.csv|*"
    }
  });

  logger.verbose('=== csv > csv_output.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./output/csv/|output.json|*"
    }
  });

  logger.verbose('=== timeseries.csv > csv_timeseries.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          "time": "date",
          "temp": "number"
        }
      },
    },
    terminal: {
      smt: "json|./output/csv/|timeseries.json|*"
    }
  });
*/
  logger.verbose('=== fueltrim.csv > csv_fueltrim.json');
  await transfer({
    origin: {
      smt: "csv|./test/data/|fueltrim.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./output/csv/|fueltrim.json|*"
    }
  });

}

(async () => {
  await tests();
})();
