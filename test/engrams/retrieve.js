/**
 * test/engrams/retrieve
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   retreive all entries starting with foo_schema*
 *   compare results to expected codex entries
 */
"use strict";

const { Codex } = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex retrieve");

async function init() {
  let result = 0;
  try {
    // activate codex
    let engrams = Codex.use("engram", "elasticsearch|http://dev.dictadata.net:9200/|storage_engrams|*");
    if (!await engrams.activate())
      result = 1;
  }
  catch (err) {
    logger.error(err);
    result = 1;
  }
  return result;
}

async function test(schema) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + schema);

    // retrieve codex entries
    let results = await Codex.engrams.retrieve({
      match: {
        "name": {
          wc: schema + "*"
        }
      }
    });

    let outputfile = "./test/data/output/engrams/retrieve_" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(results, null, 2), "utf8");

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

  await Codex.engrams.relax();
})();
