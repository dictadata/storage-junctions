/**
 * test/rest
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: ftp transfers");

async function ftpUpload() {
  logger.verbose("=== ftp uploads");

  logger.verbose('=== ftp: csv_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    terminus: {
      smt: "csv|ftp:/test/output/|csv_output.csv|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    }
  });

  logger.verbose('=== ftp: csv_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminus: {
      smt: "csv|ftp:/test/output/|csv_output.csv.gz|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    }
  });

  logger.verbose('=== ftp: json_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminus: {
      smt: "json|ftp:/test/output/|json_output.json|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    }
  });

  logger.verbose('=== ftp: json_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "json|ftp:/test/output/|json_output.json.gz|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    }
  });

}

async function ftpDownload() {
  logger.verbose("=== ftp downloads");

  logger.verbose('=== ftp_output.csv');
  await transfer({
    origin: {
      smt: "csv|ftp:/test/data/|foofile.csv.gz|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminus: {
      smt: "csv|./test/output/|ftp_output.csv|*"
    }
  });

  logger.verbose('=== ftp_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|ftp:/test/data/|foofile.csv|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminus: {
      smt: "csv|./test/output/|ftp_output.csv.gz|*"
    }
  });

  logger.verbose('=== ftp_output.json');
  await transfer({
    origin: {
      smt: "json|ftp:/test/data/|foofile.json.gz|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminus: {
      smt: "json|./test/output/|ftp_output.json|*"
    }
  });

  logger.verbose('=== ftp_output.json.gz');
  await transfer({
    origin: {
      smt: "json|ftp:/test/data/|foofile.json|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        }
      }
    },
    terminus: {
      smt: "json|./test/output/|ftp_output.json.gz|*"
    }
  });

}

async function tests() {
  await ftpUpload();
  await ftpDownload();
  logger.verbose("Done.");
}

tests();
