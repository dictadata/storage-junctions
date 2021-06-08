/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: ftp transfers");

async function test_01() {
  logger.verbose("=== fs to ftp");

  logger.verbose('=== ftp: csv_output.csv');
  if (await dullSchema({ smt: "csv|ftp://dicta:data@localhost/data/output/csv/|output.csv|*" })) return 1;
  
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|ftp://dicta:data@localhost/data/output/csv/|output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== ftp: csv_output.csv.gz');
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|ftp://dicta:data@localhost/data/output/csv/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== ftp: json_output.json');
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/data/output/json/|output.json|*",
      options: {}
    }
  })) return 1;

  logger.verbose('=== ftp: json_output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile.json|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/data/output/json/|output.json.gz|*",
      options: {}
    }
  })) return 1;

}

async function test_02() {
  logger.verbose("=== ftp to fs");

  logger.verbose('=== ftp_output.csv');
  if (await transfer({
    origin: {
      smt: "csv|ftp://dicta:data@localhost/data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/ftp/|output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== ftp_output.csv.gz');
  if (await transfer({
    origin: {
      smt: "csv|ftp://dicta:data@localhost/data/test/|foofile.csv|*",
      options: {}
    },
    terminal: {
      smt: "csv|./data/output/ftp/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== ftp_output.json');
  if (await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/data/test/|foofile.json.gz|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/ftp/|output.json|*"
    }
  })) return 1;

  logger.verbose('=== ftp_output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/data/test/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/ftp/|output.json.gz|*"
    }
  })) return 1;

}

(async () => {
  if (await test_01()) return 1;
  if (await test_02()) return 1;
})();
