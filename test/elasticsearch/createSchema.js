/**
 * test/elasticsearch/createSchema
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const dull = require("../lib/_dull");
const { logger } = require('../../storage/utils');
const fs = require('node:fs');
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

logger.info("===== elasticsearch createSchema ");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./data/input/encodings/" + encoding + ".encoding.json",
        refresh: true
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*"
    }
  })) return 1;

}

async function test_lg() {

  logger.info("=== elasticsearch large fields");
  if (await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_lg|*",
      options: {
        encoding: "./data/input/encodings/foo_schema_lg.encoding.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  })) return 1;

}

async function test_origin(schema, encoding) {

  let ca_file = fs.readFileSync(homedir + "/.dictadata/ec2_elasticsearch-ca.pem");

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "elasticsearch|https://data-origin.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./data/input/encodings/" + encoding + ".encoding.json",
        refresh: true,
        auth: {
          apiKey: "MmdIVVlZY0JsdG9DN2ZieFNsTUQ6bEdGNlkzVHdRNm16bmlJQVNJd1J3Zw=="
        },
        tls: {
          ca: ca_file,
          rejectUnauthorized: true
        }
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "elasticsearch|https://data-origin.dictadata.net:9200|" + schema + "|*",
      options: {
        auth: {
          apiKey: "MmdIVVlZY0JsdG9DN2ZieFNsTUQ6bEdGNlkzVHdRNm16bmlJQVNJd1J3Zw=="
        },
        tls: {
          ca: ca_file,
          rejectUnauthorized: true
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return;
  if (await test("foo_schema_x", "foo_schema")) return;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return;
  if (await test("foo_schema_02", "foo_schema_02")) return;
  if (await test("foo_schema_two", "foo_schema_two")) return;
  if (await test_lg()) return;

  if (await test_origin("foo_schema", "foo_schema")) return;
})();
