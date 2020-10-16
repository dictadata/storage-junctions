/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: ftp transfers");

async function test_01() {
  logger.verbose("=== ftp destination");

  logger.verbose('=== ftp: csv_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    terminal: {
      smt: "csv|ftp://dicta:data@localhost/test/output/|csv_output.csv|*",
      options: {}
    }
  });

  logger.verbose('=== ftp: csv_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminal: {
      smt: "csv|ftp://dicta:data@localhost/test/output/|csv_output.csv.gz|*",
      options: {}
    }
  });

  logger.verbose('=== ftp: json_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/test/output/|json_output.json|*",
      options: {}
    }
  });

  logger.verbose('=== ftp: json_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "json|ftp://dicta:data@localhost/test/output/|json_output.json.gz|*",
      options: {}
    }
  });

}

async function test_02() {
  logger.verbose("=== ftp source");

  logger.verbose('=== ftp_output.csv');
  await transfer({
    origin: {
      smt: "csv|ftp://dicta:data@localhost/test/data/|foofile.csv.gz|*",
      options: {}
    },
    terminal: {
      smt: "csv|./test/output/|ftp_output.csv|*"
    }
  });

  logger.verbose('=== ftp_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|ftp://dicta:data@localhost/test/data/|foofile.csv|*",
      options: {}
    },
    terminal: {
      smt: "csv|./test/output/|ftp_output.csv.gz|*"
    }
  });

  logger.verbose('=== ftp_output.json');
  await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/test/data/|foofile.json.gz|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/output/|ftp_output.json|*"
    }
  });

  logger.verbose('=== ftp_output.json.gz');
  await transfer({
    origin: {
      smt: "json|ftp://dicta:data@localhost/test/data/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/output/|ftp_output.json.gz|*"
    }
  });

}

(async () => {
  await test_01();
  await test_02();
  logger.verbose("Done.");
})();
