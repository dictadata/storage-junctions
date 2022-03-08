/**
 * test/cortex/dull
 *
 * Test Outline:
 *   use cortex with Elasticsearch junction
 *   dull engram definition for "foo_schema_two" in cortex
 */
"use strict";

const storage = require("../../storage");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: cortex dull");

async function init() {
  try {
    // activate cortex
    let cortex = new storage.Cortex({
      smt: "elasticsearch|http://localhost:9200/|dicta_cortex|!name"
    });

    await cortex.activate();
    storage.cortex = cortex;
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
    let results = await storage.cortex.dull(schema);
    logger.info(JSON.stringify(results, null, "  "));

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

  await storage.cortex.relax();

  // give Elasticsearch time to refresh its index
  await new Promise((r) => setTimeout(r, 1100));
})();
