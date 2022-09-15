/**
 * test/codex/use_smt
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

logger.info("=== Tests: codex store");

async function init() {
  try {
    // activate codex
    let codex = new Storage.Codex("elasticsearch|http://dev.dictadata.org:9200/|dicta_codex|*");
    await codex.activate();
    Storage.codex = codex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(name) {
  let retCode = 0;
  let smt_urn = "foo:" + name;

  try {
    logger.verbose('=== ' + smt_urn);

    // create junction
    let junction = await Storage.activate(smt_urn, { auth: { "username": "dicta", password: "data" } });

    // retrieve codex entries
    let results = await junction.retrieve({
      match: {
        "Bar": {
          wc: "row*"
        }
      }
    });

    let outputfile = "./data/output/codex/" + name + ".json";
    logger.verbose("output file: " + outputfile);
    fs.mkdirSync(path.dirname(outputfile), { recursive: true });
    fs.writeFileSync(outputfile, JSON.stringify(results.data, null, 2), "utf8");

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
