/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('@dictadata/storage-lib');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "elasticsearch|http://dev.dictadata.net:9200|foo_transfer|*"
  })) return 1;

  logger.info("=== csv => elasticsearch");
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"
    }
  })) return 1;

  logger.info("=== json => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_j|!Foo"
    }
  })) return 1;

  logger.info("=== json 01 => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_01|!Foo"
    }
  })) return 1;

  logger.info("=== json 02 => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foo_widgets.json|*"
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
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_transfer|!Foo"
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
      smt: "csv|./test/data/output/elasticsearch/|transfer_foo.csv|*",
      options: {
        header: true,
        append: false
      },
      output: "./test/data/output/elasticsearch/transfer_foo.csv"
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
      smt: "json|./test/data/output/elasticsearch/|transfer_foo_j.json|*",
      options: {
        append: false
      }
    },
    output: "./test/data/output/elasticsearch/transfer_foo_j.json"
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
      smt: "json|./test/data/output/elasticsearch/|transfer_foo_notfound.json|*",
      options: {
        append: false
      }
    },
    output: "./test/data/output/elasticsearch/transfer_foo_notfound.json"
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
