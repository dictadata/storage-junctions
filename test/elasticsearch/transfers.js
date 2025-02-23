/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../_lib/_transfer');
const dullSchema = require('../_lib/_dullSchema');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "elasticsearch|http://dev.dictadata.net:9200|foo_transfer|*"
  })) return 1;

  logger.info("=== csv => elasticsearch");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"
    }
  })) return 1;

  logger.info("=== json => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_j|!Foo"
    }
  })) return 1;

  logger.info("=== json 01 => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_01|!Foo"
    }
  })) return 1;

  logger.info("=== json 02 => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foo_widgets.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_widgets|!Foo"
    }
  })) return 1;

  logger.info("=== elasticsearch => elasticsearch");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*"
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_transfer|!Foo",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema.engram.json",
        refresh: true
      }
    }
  })) return 1;

  logger.info("=== elasticsearch => csv");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_transfer|*",
      options: {},
      pattern: {
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/elasticsearch/|transfer_foo.csv|*",
      options: {
        addHeader: true,
        append: false
      },
      output: "./test/_data/output/elasticsearch/transfer_foo.csv"
    }
  })) return 1;

  logger.info("=== elasticsearch => json");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_j|!Foo",
      options: {},
      pattern: {
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      smt: "json|./test/_data/output/elasticsearch/|transfer_foo_j.json|*",
      options: {
        append: false
      }
    },
    output: "./test/_data/output/elasticsearch/transfer_foo_j.json"
  })) return 1;


  logger.info("=== elasticsearch not found");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo",
      options: {},
      pattern: {
        "match": {
          "Foo": "none"
        }
      }
    },
    terminal: {
      smt: "json|./test/_data/output/elasticsearch/|transfer_foo_notfound.json|*",
      options: {
        append: false
      }
    },
    output: "./test/_data/output/elasticsearch/transfer_foo_notfound.json"
  })) return 1;

  logger.verbose('=== timeseries.csv > elasticsearch');
  if (await transfer({
    origin: {
      smt: "csv|/var/dictadata/test/data/input/|timeseries.csv|*",
      options: {
        hasHeader: false,
        encoding: {
          fields: {
            "time": "date",
            "temp": "number"
          }
        }
      }
    },
    terminal: {
      smt: "elastic|http://dev.dictadata.net:9200/|timeseries|!",
      options: {
        refresh: true
      }
    }
  })) return 1;

  logger.verbose('=== elasticsearch > timeseries.csv');
  if (await transfer({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|timeseries|!",
      options: {
        count: 300
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/elasticsearch/|timeseries.csv|*",
      options: {
        addHeader: false
      },
      output: "./test/_data/output/elasticsearch/timeseries.csv"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
