/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../lib/logger');

logger.info("===== elasticsearch encoding ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  await dullSchema({
    smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
  });

  logger.info("=== createSchema " + schema);
  await createSchema({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|!Foo",
      options: {
        encoding: "./test/data/" + encoding + ".json"
      }
    }
  });

  logger.info("=== getEncoding " + schema);
  await getEncoding({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
    },
    terminal: {
      output: "./output/elasticsearch/" + encoding + ".json"
    }
  });
}

(async () => {
  await test("foo_schema", "encoding_foo");
  await test("foo_schema_01", "encoding_foo_01");
  await test("foo_schema_02", "encoding_foo_02");
})();
