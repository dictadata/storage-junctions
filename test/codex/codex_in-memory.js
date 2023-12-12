/**
 * test/codex/codex_in-memory
 *
 * Test Outline:
 *   Uses codex with Memory Junction
 *   read encoding(s) from file
 *   store engram definition(s) in codex
 *   recall engram(s) from codex
 *   compare results with expected SMT engram definitions
 */
"use strict";

const Storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex in-memory");

async function init() {
  try {
    // activate codex
    let codex = new Storage.Codex("memory|dictadata|codex|*");
    await codex.activate();
    Storage.codex = codex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(schema) {
  let retCode = 0;

  let encoding;
  try {
    // store encoding
    logger.verbose('=== store/recall ' + schema);
    encoding = JSON.parse(fs.readFileSync("./test/data/input/encodings/" + schema + ".encoding.json", "utf8"));
    encoding.name = schema;

    let entry = new Engram(encoding);
    let results = await Storage.codex.store(entry);
    logger.verbose(JSON.stringify(results, null, "  "));

    // recall encoding
    let urn = entry.urn;
    results = await Storage.codex.recall(urn);
    logger.verbose("recall: " + results.message);

    if (results.status === 0) {
      //encoding = results.data[ urn ];

      let outputfile = "./test/data/output/codex/" + schema + ".encoding.json";
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

  if (await test("foo_schema")) return 1;
  if (await test("foo_schema_short")) return 1;
  if (await test("foo_schema_typesonly")) return 1;

  await Storage.codex.relax();
})();
