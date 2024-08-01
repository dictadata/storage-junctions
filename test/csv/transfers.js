/**
 * test/csv
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: csv data transfers");

async function tests() {

  logger.verbose('=== timeseries.csv > csv_timeseries.json');
  if (await transfer({
    origin: {
      smt: "csv|/var/dictadata/test/data/input/|timeseries.csv|*",
      options: {
        separator: ",",
        hasHeader: false,
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
      output: "/var/dictadata/test/data/output/csv/transfer_timeseries.json"
    }
  })) return 1;

  logger.verbose('=== csv > transfer_1.csv');
  let rc = await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/csv/|transfer_1.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/csv/transfer_1.csv"
    }
  });
  if (rc)
    return 1;

  logger.verbose('=== csv > transfer_badfile.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile_badfile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/csv/|transfer_badfile.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/csv/transfer_badfile.csv"
    }
  }, -1)) return 1;

  logger.verbose('=== csv > csv_output_noheader.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/csv/|transfer_noheader.csv|*",
      output: "./test/_data/output/csv/transfer_noheader.csv"
    }
  })) return 1;

  logger.verbose('=== csv > csv_output.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "json|./test/_data/output/csv/|transfer_2.json|*",
      output: "./test/_data/output/csv/transfer_2.json"
    }
  })) return 1;

  logger.verbose('=== csv > csv_output.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.txt|*",
      options: {
        hasHeader: true,
        separator: "\t"
      }
    },
    terminal: {
      smt: "json|./test/_data/output/csv/|transfer_3.json|*",
      output: "./test/_data/output/csv/transfer_3.json"
    }
  })) return 1;

  logger.verbose('=== csv > transfer_dataPath.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        dataPath: "/var/dictadata/",
        hasHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/csv/|transfer_dataPath.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/csv/transfer_dataPath.csv"
    }
  })) return 1;

  logger.verbose('=== foo_data.txt');
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foo_data.txt|*",
      options: {
        hasHeader: true,
        separator: "\t"
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/csv/|transfer_data.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/csv/transfer_data.csv"
    }
  })) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
