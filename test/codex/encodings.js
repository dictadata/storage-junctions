/**
 * test/csv
 */
"use strict";

const { Codex } = require("../../storage/codex");
const { logger } = require("../../storage/utils");
const fs = require("fs");
const { Engram } = require("../../storage/types");

logger.info("=== Tests: codex encodings");

async function test(schema) {
  let retCode = 0;

  let codex = new Codex();
  let encoding;
  try {
    // store encoding
    logger.verbose('=== ' + schema);
    encoding = JSON.parse(fs.readFileSync("./test/data/input/" + schema + ".encoding.json", "utf8"));

    let engram = new Engram(encoding.smt || "*|*|*|*");
    engram.name = schema;
    engram.encoding = encoding;
    codex.store(engram.encoding);

    // recall encoding
    encoding = codex.recall(schema);
    let outputfile = "./test/data/output/codex/" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.writeFileSync(outputfile, JSON.stringify(encoding, null, 2), "utf8");
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }
  finally {
    if (codex) codex.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  //if (await test("foo_schema")) return 1;
  //if (await test("foo_schema_short")) return 1;
  if (await test("foo_schema_typesonly")) return 1;
})();
