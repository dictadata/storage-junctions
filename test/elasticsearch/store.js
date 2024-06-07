/**
 * test/elasticsearch
 */
"use strict";

const store = require('../lib/_store');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: elasticsearch");

async function keystore() {

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"
    },
    construct: {
      "Foo": "second",
      "Bar": "row",
      "Baz": 456,
      "Fobe": 2.1,
      "Dt Test": "10/07/2018",
      "enabled": false
    },
    terminal: {
      output: "./test/data/output/elasticsearch/store_ks1.json"
    }
  }, 1)) return 1;

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo",
      options: {
        refresh: true
      }
    },
    construct: {
      Foo: 'one',
      Bar: 'Washington',
      Baz: 1,
      Fobe: 1.1,
      "Dt Test": "10/07/2018",
      enabled: false
    },
    terminal: {
      output: "./test/data/output/elasticsearch/store_ks2.json"
    }
  }, 1)) return 1;

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20,
      Fobe: 20.20,
      "Dt Test": "2020-10-07T08:00:00",
      enabled: true
    },
    terminal: {
      output: "./test/data/output/elasticsearch/store_ks3.json"
    }
  }, 1)) return 1;

}

async function primarykey() {

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|=Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20,
      Fobe: 20.20,
      "Dt Test": "2020-10-07 08:00:00",
      enabled: true
    },
    terminal: {
      output: "./test/data/output/elasticsearch/store_pk1.json"
    }
  }, 0)) return 1;

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|=Foo"
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      Fobe: 0.10,
      "Dt Test": "2020-10-07",
      enabled: true
    },
    terminal: {
      output: "./test/data/output/elasticsearch/store_pk2.json"
    }
  }, 0)) return 1;

}

(async () => {
  if (await keystore()) return 1;
  if (await primarykey()) return 1;
})();
