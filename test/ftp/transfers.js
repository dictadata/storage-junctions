/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../lib/logger');


logger.info("=== Test: ftp transfers");

async function test_01() {
  logger.verbose("=== fs to ftp");

  logger.verbose('=== ftp: csv_output.csv');
  await dullSchema({ smt: "csv|ftp://dicta:data@localhost/test/output/csv/|output.csv|*" });
  
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|ftp://dicta:data@localhost/test/output/csv/|output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== ftp: csv_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|ftp://dicta:data@localhost/test/output/csv/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== ftp: json_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/test/output/json/|output.json|*",
      options: {}
    }
  });
/*
  logger.verbose('=== ftp: json_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/test/output/json/|output.json.gz|*",
      options: {}
    }
  });
*/
}


async function test_02() {
  logger.verbose("=== ftp to fs");

  logger.verbose('=== ftp_output.csv');
  await transfer({
    origin: {
      smt: "csv|ftp://dicta:data@localhost/test/data/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/ftp/|output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== ftp_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|ftp://dicta:data@localhost/test/data/|foofile.csv|*",
      options: {}
    },
    terminal: {
      smt: "csv|./output/ftp/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== ftp_output.json');
  await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/test/data/|foofile.json.gz|*",
      options: {}
    },
    terminal: {
      smt: "json|./output/ftp/|output.json|*"
    }
  });

  logger.verbose('=== ftp_output.json.gz');
  await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/test/data/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./output/ftp/|output.json.gz|*"
    }
  });

}

(async () => {
  await test_01();
  await test_02();
})();
