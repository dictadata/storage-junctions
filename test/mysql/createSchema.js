/**
 * test/mysql/createSchema
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const dull = require("../lib/_dull");
const { logger, typeOf } = require('../../storage/utils');
const fs = require('node:fs');
const homedir = require('os').homedir();

logger.info("=== Test: mysql createSchema");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "mysql|host=dev.dictadata.org;database=storage_node|" + schema + "|*",
      options: {
        auth: {
          username: "dicta",
          password: "data"
        },
        encoding: "./data/input/" + encoding + ".encoding.json"
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "mysql|host=dev.dictadata.org;database=storage_node|" + schema + "|*"
    }
  })) return 1;

}

async function test_lg() {

  logger.info("=== mysql large fields");
  if (await createSchema({
    origin: {
      smt: "mysql|host=dev.dictadata.org;database=storage_node|foo_schema_lg|*",
      options: {
        encoding: "./data/input/foo_schema_lg.encoding.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  })) return 1;

}

async function test_origin(schema, encoding) {

  let ca_file = fs.readFileSync(homedir + "/.dictadata/ec2_mysql-ca.pem");
  console.log(typeOf(ca_file));

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "mysql|host=data-origin.dictadata.org;database=storage_node|" + schema + "|*",
      options: {
        auth: {
          username: "dicta",
          password: "data"
        },
        ssl: {
          ca: ca_file,
          rejectUnauthorized: true
        },
        encoding: "./data/input/" + encoding + ".encoding.json"
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "mysql|host=data-origin.dictadata.org;database=storage_node|" + schema + "|*",
      options: {
        auth: {
          username: "dicta",
          password: "data"
        },
        ssl: {
          ca: ca_file,
          rejectUnauthorized: true
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_x", "foo_schema")) return 1;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_schema_02", "foo_schema_02")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;
  if (await test_lg()) return 1;

  if (await test_origin("foo_schema", "foo_schema")) return 1;
})();
