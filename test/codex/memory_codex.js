/**
 * test/codex/memory_codex
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex encodings");

// Test Outline:
// read encoding(s) from file
// store to local elasticsearch codex
// recall encoding from codex

async function test(schema) {
  let retCode = 0;

  storage.codex = new storage.Codex({
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
    await storage.codex.store(engram.encoding);

    // recall encoding
    encoding = await storage.codex.recall(schema);
    let outputfile = "./test/data/output/codex/" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(encoding, null, 2), "utf8");
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }
  finally {
    //await storage.codex.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test("foo_schema")) return 1;
  if (await test("foo_schema_short")) return 1;
  if (await test("foo_schema_typesonly")) return 1;
})();
