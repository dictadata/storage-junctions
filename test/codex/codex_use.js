/**
 * test/codex/codex_use
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   create junction using SMT name(s)
 *   use junction to retrieve data
 *   compare results with expected output
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: codex use");

async function init() {
  try {
    // activate codex
    let codex = new Storage.Codex("elasticsearch|http://dev.dictadata.net:9200/|storage_codex|*");
    await codex.activate();
    Storage.codex = codex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(name) {
  let retCode = 0;
  let urn = "foo:" + name;

  try {
    logger.verbose('=== retrieve ' + urn);

    // create junction
    let junction = await Storage.activate(urn, { auth: { "username": "dicta", password: "data" } });

    // retrieve codex entries
    let results = await junction.retrieve({
      match: {
        "Bar": {
          wc: "row*"
        }
      }
    });

    let outputfile = "./test/data/output/codex/use_" + name + ".json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(results, null, 2), "utf8");

    // compare to expected output
    let expected_output = outputfile.replace("output", "expected");
    retCode = _compare(expected_output, outputfile, 2);

    await junction.relax();
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

(async () => {
  await init();

  if (await test("jsonfile-foo_schema")) return 1;
  if (await test("elasticsearch-foo_schema")) return 1;
  if (await test("elasticsearch-foo_alias")) return 1;
  if (await test("mssql-foo_schema")) return 1;
  if (await test("mysql-foo_schema")) return 1;

  await Storage.codex.relax();
})();
