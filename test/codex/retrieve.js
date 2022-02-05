/**
 * test/codex/retrieve
 */
"use strict";

const storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex retrieve");

// Test Outline:
// use codex in Elasticsearch index
// retreive all entry starting with foo_*


async function test(schema) {
  let retCode = 0;

  storage.codex = new storage.Codex({
    smt: "elasticsearch|http://localhost:9200/|dicta_codex|!name"
  });

  try {
    logger.verbose('=== ' + schema);

    // recall encoding
    let results = await storage.codex.retrieve({
      match: {
        name: {
          "eq": "foo_schema_*"
        }
      }
    });

    let outputfile = "./test/data/output/codex/" + schema + ".encoding.json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(results, null, 2), "utf8");

    // compare to expected output

  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }
  finally {
    await storage.codex.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test("foo_schema")) return 1;
})();
