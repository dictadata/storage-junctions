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
  let retCode = await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./test/data/input/encodings/" + encoding + ".encoding.json",
        refresh: true
      }
    }
  });
  if (retCode > 0) return 1;

  if (retCode < 0) {
    // if schema already exists then truncate constructs
    logger.info("=== dull (truncate) " + schema);
    if (await dull({
      origin: {
        smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*"
      }
    })) return 1;
  }
}

async function test_lg() {
  logger.info("=== elasticsearch test_lg large fields");

  logger.info("=== createSchema foo_schema_lg");
  let retCode = await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_lg|*",
      options: {
        encoding: "./test/data/input/encodings/foo_schema_lg.encoding.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  });
  if (retCode > 0) return 1;

}

async function test_origin(schema, encoding) {
  logger.info("=== elasticsearch test_origin");

  let ca_file = fs.readFileSync(homedir + "/.dictadata/ec2_elasticsearch-ca.pem");

  logger.info("=== createSchema " + schema);
  let retCode = await createSchema({
    origin: {
      smt: "elasticsearch|https://data-origin.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./test/data/input/encodings/" + encoding + ".encoding.json",
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
  });
  if (retCode > 0) return 1;

  if (retCode < 0) {
    // if schema already exists then truncate constructs
    // use credentials from auth_entries.json file
    logger.info("=== dull (truncate) " + schema);
    if (await dull({
      origin: {
        smt: "elasticsearch|https://data-origin.dictadata.net:9200|" + schema + "|*"
      }
    })) return 1;
  }
}

(async () => {
  if (await test("foo_schema", "foo_schema")) return;
  if (await test("foo_schema_x", "foo_schema")) return;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return;
  if (await test("foo_widgets", "foo_widgets")) return;
  if (await test("foo_schema_two", "foo_schema_two")) return;

  if (await test_lg()) return;

  // if (await test_origin("foo_schema", "foo_schema")) return;
})();
