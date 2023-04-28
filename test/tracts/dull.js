/**
 * test/tracts/dull
 *
 * Test Outline:
 *   use tracts with Elasticsearch junction
 *   dull engram definition for "foo_schema_two" in tracts
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");

logger.info("=== Tests: tracts dull");

async function init() {
  try {
    // activate tracts
    let tracts = new Storage.Tracts("elasticsearch|http://dev.dictadata.net:9200/|dicta_tracts|*");
    await tracts.activate();
    Storage.tracts = tracts;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(domain, schema) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + schema);

    // dull encoding
    let results = await Storage.tracts.dull({ domain: domain, name: schema });
    logger.info(JSON.stringify(results, null, "  "));

    // compare to expected output

  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

async function dull(keys) {
  let retCode = 0;

  try {
    for (let key of keys) {
      logger.verbose('=== ' + key);

      // dull encoding
      let results = await Storage.tracts.dull(key);
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

  if (await test("", "foo_schema_two")) return 1;

  await dull(["foo/foo_schema_XYZ" ]);

  await Storage.tracts.relax();

  // give Elasticsearch time to refresh its index
  await new Promise((r) => setTimeout(r, 1100));
})();
