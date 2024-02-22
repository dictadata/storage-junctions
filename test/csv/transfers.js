/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: csv data transfers");

async function tests() {

  logger.verbose('=== csv > transfer_1.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|transfer_1.csv|*",
      options: {
        header: true
      },
      output: "./test/data/output/csv/transfer_1.csv"
    }
  })) return 1;

  logger.verbose('=== csv > transfer_badfile.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile_badfile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|transfer_badfile.csv|*",
      options: {
        header: true
      },
      output: "./test/data/output/csv/transfer_badfile.csv"
    }
  }, -1)) return 1;

  logger.verbose('=== csv > csv_output_noheader.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|transfer_noheader.csv|*",
      output: "./test/data/output/csv/transfer_noheader.csv"
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
      smt: "json|./test/data/output/csv/|transfer_2.json|*",
      output: "./test/data/output/csv/transfer_2.json"
    }
  })) return 1;

  logger.verbose('=== csv > csv_output.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.txt|*",
      options: {
        header: true,
        separator: "|"
      }
    },
    terminal: {
      smt: "json|./test/data/output/csv/|transfer_3.json|*",
      output: "./test/data/output/csv/transfer_3.json"
    }
  })) return 1;

  logger.verbose('=== timeseries.csv > csv_timeseries.json');
  if (await transfer({
    origin: {
      smt: "csv|/var/dictadata/test/data/input/|timeseries.csv|*",
      options: {
        header: false,
        encoding: {
          fields: {
            "time": "date",
            "temp": "number"
          }
        }
      },
    },
    terminal: {
      smt: "json|/var/dictadata/test/data/output/csv/|transfer_timeseries.json|*",
      "output": "/var/dictadata/test/data/output/csv/transfer_timeseries.json"
    }
  })) return 1;

  logger.verbose('=== csv > transfer_dataPath.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        dataPath: "/var/dictadata/",
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/csv/|transfer_dataPath.csv|*",
      options: {
        header: true
      },
      output: "./test/data/output/csv/transfer_dataPath.csv"
    }
  })) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
