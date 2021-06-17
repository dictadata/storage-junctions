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
      smt: "csv|ftp://dicta:data@localhost/test/data/|foofile.csv.gz|*",
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
      smt: "csv|ftp://dicta:data@localhost/test/data/|foofile.csv|*",
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
      smt: "json|ftp://dicta:data@localhost/test/data/|foofile.json.gz|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/ftp/|output.json|*"
    }
  })) return 1;

  logger.verbose('=== local output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/test/data/|foofile.json|*",
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
  if (await dullSchema({ smt: "csv|ftp://dicta:data@localhost/data/output/csv/|output.csv|*" })) return 1;
  
  if (await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*",
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

  logger.verbose('=== ftp output.csv.gz');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
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

  logger.verbose('=== ftp output.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/data/output/json/|output.json|*",
      options: {}
    }
  })) return 1;
/*
  !!! there is a sporadic prolem with this test
  !!! maybe some kind of race condition or stream ending issue

  logger.verbose('=== ftp output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/data/output/json/|output.json.gz|*",
      options: {}
    }
  })) return 1;
*/
}

(async () => {
  if (await test_read()) return 1;
  if (await test_write()) return 1;
})();
