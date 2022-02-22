/**
 * test/codex/retrieve
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   retreive all entries starting with foo_schema*
 *   compare results to expected codex entries
 */
"use strict";

const storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex retrieve");

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

    // retrieve codex entries
    let results = await storage.codex.retrieve({
      match: {
        "name": {
          wc: "foo_schema*"
        }
      }
    });

    let outputfile = "./test/data/output/codex/retrieve_" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(results.data, null, 2), "utf8");

    // compare to expected output
    let expected_output = outputfile.replace("output", "expected");
    retCode = _compare(expected_output, outputfile, 2);
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

  await storage.codex.relax();
})();
