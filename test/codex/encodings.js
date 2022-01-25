/**
 * test/csv
 */
"use strict";

const storage = require("../../storage");
const { Codex } = require("../../storage/codex");
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

  let codex = new Codex({
    smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
  });
  await codex.activate();

  let encoding;
  try {
    // store encoding
    logger.verbose('=== ' + schema);
    encoding = JSON.parse(fs.readFileSync("./test/data/input/" + schema + ".encoding.json", "utf8"));

    let engram = new Engram(encoding.smt || "*|*|*|*");
    engram.name = schema;
    engram.encoding = encoding;
    await codex.store(engram.encoding);

    // recall encoding
    encoding = await codex.recall(schema);
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
    if (codex) await codex.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test("foo_schema")) return 1;
  if (await test("foo_schema_short")) return 1;
  if (await test("foo_schema_typesonly")) return 1;
})();
