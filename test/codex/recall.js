/**
 * test/codex/recall
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   recall engram definition for foo_schema
 *   compare results to expected foo_schema encoding
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex recall");

async function init() {
  try {
    // activate codex
    let codex = new Storage.Codex({
      smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
    });

    await codex.activate();
    Storage.codex = codex;
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
    let results = await Storage.codex.recall(schema);
    logger.verbose(JSON.stringify(results, null, "  "));

    if (results.resultCode !== 0) {
      retCode = results.resultCode;
    }
    else {
      let encoding = results.data[ schema ];

      let outputfile = "./test/data/output/codex/recall_" + schema + ".encoding.json";
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

  if (await test("foo_schema"))
    return 1;
  if (await test("foo_alias"))
    return 1;
  if (await test("bad_smt_name"))
    process.exitCode = 0;
  else
    return 1;

  await Storage.codex.relax();
})();

