/**
 * test/elasticsearch
 */
"use strict";

const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const dull = require('./_dull');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch store");
  let uid = await store({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== elasticsearch recall uid");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|" + uid }
  });

  logger.info("=== elasticsearch recall !");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!",
      pattern: {
        key: uid
      }
    }
  });

  logger.info("=== elasticsearch recall !Foo");
  await recall({
    source: {
      smt: {
        model: "elasticsearch",
        locus: "http://localhost:9200",
        schema: "test_schema",
        key: "!Foo"
      },
      pattern: {
        Foo: uid
      }
    }
  });

  logger.info("=== elasticsearch recall =Foo");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|=Foo",
      pattern: {
        Foo: uid
      }
    }
  });

  logger.info("=== elasticsearch retrieve");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*",
      pattern: {
        match: {
          "Foo": 'twenty'
        }
      }
    }
  });

  logger.info("=== elasticsearch retrieve");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*",
      pattern: {
        cues: {
          "order": { "Foo": "asc" },
          "count": 100
        }
      }
    }
  });

  logger.info("=== elasticsearch retrieve with pattern");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        cues: {
          count: 3,
          order: { "Dt Test": "asc" },
          fields: ["Foo", "Baz"]
        }
      }
    }
  });

  logger.info("=== elasticsearch dull");
  await dull({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo",
      pattern: {
        Foo: 'twenty'
      }
    }
  });

}

tests();
