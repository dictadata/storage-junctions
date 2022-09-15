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
    let codex = new Storage.Codex("elasticsearch|http://dev.dictadata.org:9200/|dicta_codex|*");
    await codex.activate();
    Storage.codex = codex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(domain, schema) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + schema);

    // recall engram definition
    let results = await Storage.codex.recall({ domain: domain, name: schema });
    logger.verbose(JSON.stringify(results, null, "  "));

    if (results.resultCode !== 0) {
      retCode = results.resultCode;
    }
    else {
      let smt_id = Object.keys(results.data)[ 0 ];
      let encoding = results.data[ smt_id ];

      let outputfile = "./data/output/codex/recall_" + schema + ".encoding.json";
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

  if (await test("foo", "foo_schema"))
    return 1;
  if (await test("foo", "foo_alias"))
    return 1;
  if (await test("", "bad_smt_name"))
    process.exitCode = 0;
  else
    return 1;

  await Storage.codex.relax();
})();

