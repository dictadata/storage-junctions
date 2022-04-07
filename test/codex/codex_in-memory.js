/**
 * test/codex/codex_in-memory
 *
 * Test Outline:
 *   Uses codex with Memory Junction
 *   read encoding(s) from file
 *   store engram definition(s) in codex
 *   recall engrams(s) from codex
 *   compare results with expected SMT engram definitions
 */
"use strict";

const Storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex in-memory encodings");

async function init() {
  try {
    // activate codex
    let codex = new Storage.Codex({
      smt: "memory|dictadata|codex|!name"
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

  Storage.codex = new Storage.Codex({
    smt: "memory|dictadata|codex|!name"
  });

  let encoding;
  try {
    // store encoding
    logger.verbose('=== ' + schema);
    encoding = JSON.parse(fs.readFileSync("./test/data/input/" + schema + ".encoding.json", "utf8"));

    let engram = new Engram(encoding.smt || "*|*|*|*");
    engram.name = schema;
    engram.encoding = encoding;
    let results = await Storage.codex.store(engram);
    logger.verbose(JSON.stringify(results, null, "  "));

    // recall encoding
    results = await Storage.codex.recall(schema);
    logger.verbose(JSON.stringify(results, null, "  "));
    encoding = results.data[ schema ];

    let outputfile = "./test/data/output/codex/" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(encoding, null, 2), "utf8");

    // compare to expected output
    let expected_output = outputfile.replace("output", "expected");
    retCode = _compare(expected_output, outputfile, true);
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
