/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: ftp transfers");

async function test_read() {
  logger.verbose("=== ftp to fs");

  logger.verbose('=== local output.csv');
  if (await transfer({
    origin: {
      smt: "csv|ftp://dev.dictadata.net/dictadata/test/data/input/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/ftp/|output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== local output.csv.gz');
  if (await transfer({
    origin: {
      smt: "csv|ftp://dev.dictadata.net/dictadata/test/data/input/|foofile.csv|*",
      options: {}
    },
    terminal: {
      smt: "csv|./test/data/output/ftp/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== local output.json');
  if (await transfer({
    origin: {
      smt: "json|ftp://dev.dictadata.net/dictadata/test/data/input/|foofile.json.gz|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/ftp/|output.json|*"
    }
  })) return 1;

  logger.verbose('=== local output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|ftp://dev.dictadata.net/dictadata/test/data/input/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/ftp/|output.json.gz|*"
    }
  })) return 1;

}

async function test_write() {
  logger.verbose("=== fs to ftp");

  logger.verbose('=== ftp output.csv');
  if (await dullSchema({ smt: "csv|ftp://dev.dictadata.net/dictadata/test/data/output/csv/|output.csv|*" })) return 1;

  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|ftp://dev.dictadata.net/dictadata/test/data/output/csv/|output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;
  /*
    logger.verbose('=== ftp output.csv.gz');
    if (await transfer({
      origin: {
        smt: "csv|./test/data/input/|foofile.csv|*",
        options: {
          header: true
        }
      },
      terminal: {
        smt: "csv|ftp://dev.dictadata.net/dictadata/test/data/output/csv/|output.csv.gz|*",
        options: {
          header: true
        }
      }
    })) return 1;
  */
  logger.verbose('=== ftp output.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|ftp://dev.dictadata.net/dictadata/test/data/output/json/|output.json|*",
      options: {}
    }
  })) return 1;
  /*
    logger.verbose('=== ftp output.json.gz');
    if (await transfer({
      origin: {
        smt: "json|./test/data/input/|foofile.json|*"
      },
      terminal: {
        smt: "json|ftp://dev.dictadata.net/dictadata/test/data/output/json/|output.json.gz|*",
        options: {}
      }
    })) return 1;
  */
}

(async () => {
  if (await test_read()) return 1;
  if (await test_write()) return 1;
})();
