/**
 * test/cortex/recall
 *
 * Test Outline:
 *   use cortex with Elasticsearch junction
 *   recall tract definition for foo_transfer
 *   compare results to expected foo_transfer definition
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: cortex recall");

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

async function test(domain, tract_name, resolve = false) {
  let retCode = 0;

  try {
    logger.verbose('=== recall ' + tract_name);

    // recall tract definition
    let results = await Storage.cortex.recall({ domain: domain, name: tract_name, resolve });
    logger.verbose(JSON.stringify(results, null, "  "));

    if (results.status !== 0) {
      retCode = results.status;
    }
    else {
      let outputfile = "./data/output/cortex/" + (resolve ? "resolve_" : "recall_") + tract_name + ".tract.json";
      logger.verbose("output file: " + outputfile);
      fs.mkdirSync(path.dirname(outputfile), { recursive: true });
      fs.writeFileSync(outputfile, JSON.stringify(results, null, 2), "utf8");

      // compare to expected output
      let expected_output = outputfile.replace("output", "expected");
      retCode = _compare(expected_output, outputfile, 2);
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

  if (await test("foo", "foo_transfer"))
    return 1;
  if (await test("foo", "foo_alias"))
    return 1;
  if (await test("foo", "foo_alias", true))
    return 1;
  if (await test("", "bad_urn"))
    process.exitCode = 0;
  else
    return 1;

  await Storage.cortex.relax();
})();
