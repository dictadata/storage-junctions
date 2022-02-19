/**
 * test/codex/dull
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   dull entry for "foo_schema_two" in codex
 */
"use strict";

const storage = require("../../storage");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: codex dull");

async function init() {
  try {
    // activate codex
    let codex = new storage.Codex({
      smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
    });

    await codex.activate();
    storage.codex = codex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(schema) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + schema);

    // dull encoding
    let result = await storage.codex.dull(schema);
    logger.info(result);

    // compare to expected output

  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

(async () => {
  await init();

  if (await test("foo_schema_two")) return 1;

  await storage.codex.relax();

  // give Elasticsearch time to refresh its index
  await new Promise((r) => setTimeout(r, 2000));
})();
