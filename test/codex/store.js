/**
 * test/codex/store
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   read encoding(s) from file
 *   store engram(s) in codex
 */
"use strict";

const Storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

const fs = require('fs');

logger.info("=== Tests: codex store");

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

  let encoding;
  try {
    logger.verbose('=== ' + schema);

    // store encoding
    encoding = JSON.parse(fs.readFileSync("./test/data/input/" + schema + ".encoding.json", "utf8"));

    let engram = new Engram(encoding.smt || "*|*|*|*");
    engram.name = schema;
    engram.encoding = encoding;
    let results = await Storage.codex.store(engram);
    logger.verbose(JSON.stringify(results, null, "  "));
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
  if (await test("foo_schema_two")) return 1;

  await Storage.codex.relax();
})();
