/**
 * test/cortex/recall
 *
 * Test Outline:
 *   use cortex with Elasticsearch junction
 *   recall engram definition for foo_schema
 *   compare results to expected foo_schema encoding
 */
"use strict";

const storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: cortex recall");

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

    // recall engram definition
    let results = await storage.cortex.recall(schema);
    logger.verbose(JSON.stringify(results, null, "  "));

    if (results.resultCode !== 0) {
      retCode = results.resultCode;
    }
    else {
      let encoding = results.data[ schema ];

      let outputfile = "./test/data/output/cortex/recall_" + schema + ".encoding.json";
      logger.verbose("output file: " + outputfile);
      fs.mkdirSync(path.dirname(outputfile), { recursive: true });
      fs.writeFileSync(outputfile, JSON.stringify(encoding, null, 2), "utf8");

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

  if (await test("foo_schema")) return 1;
  if (!await test("bad_smt_name")) return 1;

  await storage.cortex.relax();
})();

