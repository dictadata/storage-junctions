/**
 * test/codex/dull
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: codex dull");

// Test Outline:
// use codex in Elasticsearch index
// dull entries for foo_schema in dummy source

async function test(schema) {
  let retCode = 0;

  storage.codex = new storage.Codex({
    smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
  });

  try {
    logger.verbose('=== dummy_' + schema);

    // dull encoding
    let result = await storage.codex.dull("dummy_" + schema);
    logger.info(result);

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

