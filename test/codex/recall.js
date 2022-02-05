/**
 * test/codex/recall
 */
"use strict";

const storage = require("../../storage");
const { logger } = require("../../storage/utils");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex recall");

// Test Outline:
// use codex in Elasticsearch index
// recall entries for foo_schema in Elasticsearch, MySQL, MSSQL and JSON file
// compare entry.encoding to foo_schema.encoding.json


async function test(schema) {
  let retCode = 0;

  storage.codex = new storage.Codex({
    smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
  });

  try {
    logger.verbose('=== ' + schema);

    // recall encoding
    let encoding = await storage.codex.recall(schema);
    let outputfile = "./test/data/output/codex/" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(encoding, null, 2), "utf8");

    // compare to expected output

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

