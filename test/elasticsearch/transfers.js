/**
 * test/elasticsearch
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "elasticsearch|http://localhost:9200|foo_transfer|*"
  })) return 1;

  logger.info("=== csv => elasticsearch");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    }
  })) return 1;

  logger.info("=== json => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_j|!Foo"
    }
  })) return 1;

  logger.info("=== json 01 => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_01|!Foo"
    }
  })) return 1;

  logger.info("=== json 02 => elasticsearch");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_02.json|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_02|!Foo"
    }
  })) return 1;

  logger.info("=== elasticsearch => elasticsearch");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    terminal: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|!Foo"
    }
  })) return 1;

  logger.info("=== elasticsearch => csv");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_transfer|*",
      options: {
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      smt: "csv|./data/output/elasticsearch/|transfer_foo.csv|*",
      options: {
        header: true,
        append: false
      },
      output: "./data/output/elasticsearch/transfer_foo.csv"
    }
  })) return 1;

  logger.info("=== elasticsearch => json");
  if (await transfer({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_j|!Foo",
      options: {
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      smt: "json|./data/output/elasticsearch/|transfer_foo_j.json|*",
      options: {
        append: false
      }
    },
    output: "./data/output/elasticsearch/transfer_foo_j.json"
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
