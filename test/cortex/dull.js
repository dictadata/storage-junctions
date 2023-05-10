/**
 * test/cortex/dull
 *
 * Test Outline:
 *   use cortex with Elasticsearch junction
 *   dull tract definition for "foo_transfer_two" in cortex
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: cortex dull");

async function init() {
  try {
    // activate cortex
    let cortex = new Storage.Cortex("elasticsearch|http://dev.dictadata.net:9200/|dicta_cortex|*");
    await cortex.activate();
    Storage.cortex = cortex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(domain, name) {
  let retCode = 0;

  try {
    logger.verbose('=== dull ' + name);

    let results = await Storage.cortex.dull({ domain: domain, name: name });
    logger.info(JSON.stringify(results, null, "  "));

    // compare to expected output

  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

async function test_keys(keys) {
  let retCode = 0;

  try {
    for (let key of keys) {
      logger.verbose('=== dull ' + key);

      let results = await Storage.cortex.dull(key);
      logger.info(JSON.stringify(results, null, "  "));
    }
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

(async () => {
  await init();

  if (await test("foo", "foo_transfer_two")) return 1;

  // delete extraneous entries
  await test_keys(["foo:foo_alias" ]);

  await Storage.cortex.relax();

  // give Elasticsearch time to refresh its index
  await new Promise((r) => setTimeout(r, 1100));
})();
