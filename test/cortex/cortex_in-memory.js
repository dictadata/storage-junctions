/**
 * test/cortex/cortex_in-memory
 *
 * Test Outline:
 *   Uses cortex with Memory Junction
 *   read tract(s) from file
 *   store tract definition(s) in cortex
 *   recall tract(s) from cortex storage
 *   compare results with expected tracts definitions
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: cortex in-memory");

async function init() {
  try {
    // activate cortex
    let cortex = new Storage.Cortex("memory|dictadata|cortex|*");
    await cortex.activate();
    Storage.cortex = cortex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(tract_name) {
  let retCode = 0;

  let tract;
  try {
    // store tract
    logger.verbose('=== store/recall ' + tract_name);
    tract = JSON.parse(fs.readFileSync("./data/input/tracts/" + tract_name + ".tract.json", "utf8"));

    let results = await Storage.cortex.store(tract);
    logger.verbose(JSON.stringify(results, null, "  "));

    // recall tract
    let urn = tract.domain + ":" + tract.name;
    logger.verbose('--- ' + urn);
    results = await Storage.cortex.recall(urn);
    logger.verbose("recall: " + results.message);

    if (results.status === 0) {
      let outputfile = "./data/output/cortex/" + tract_name + ".tract.json";
      logger.verbose("output file: " + outputfile);
      fs.mkdirSync(path.dirname(outputfile), { recursive: true });
      fs.writeFileSync(outputfile, JSON.stringify(results, null, 2), "utf8");

      // compare to expected output
      let expected_output = outputfile.replace("output", "expected");
      retCode = _compare(expected_output, outputfile, 2);
    }
    else
      retCode = results.status;
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

(async () => {
  await init();

  if (await test("foo_transfer")) return 1;

  await Storage.cortex.relax();
})();