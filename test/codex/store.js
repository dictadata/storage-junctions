/**
 * test/codex/store
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

const fs = require('fs');

logger.info("=== Tests: codex store");

// Test Outline:
// use codex in Elasticsearch index
// store entries for foo_schema source in Elasticsearch, MySQL, MSSQL and JSON file

async function test(schema) {
  let retCode = 0;

  storage.codex = new storage.Codex({
    smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
  });

  let encoding;
  try {
    logger.verbose('=== ' + schema);

    // store encoding
    encoding = JSON.parse(fs.readFileSync("./test/data/input/" + schema + ".encoding.json", "utf8"));

    let engram = new Engram(encoding.smt || "*|*|*|*");
    engram.name = schema;
    engram.encoding = encoding;
    await storage.codex.store(engram.encoding);
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }
  finally {
    await storage.codex.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test("foo_schema")) return 1;
})();
