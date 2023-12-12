/**
 * test/cortex/retrieve
 *
 * Test Outline:
 *   use cortex with Elasticsearch junction
 *   retreive all entries starting with foo_transfer*
 *   compare results to expected cortex entries
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: cortex retrieve");

async function init() {
  try {
    // activate cortex
    let cortex = new Storage.Cortex("elasticsearch|http://dev.dictadata.net:9200/|dicta_cortex|*");
    await cortex.activate();
    Storage.cortex = cortex;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(tract_name) {
  let retCode = 0;

  try {
    logger.verbose('=== retrieve ' + tract_name);

    // retrieve cortex entries
    let results = await Storage.cortex.retrieve({
      match: {
        "name": {
          wc: tract_name + "*"
        }
      }
    });

    let outputfile = "./test/data/output/cortex/retrieve_" + tract_name + ".tract.json";
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

  if (await test("foo_transfer")) return 1;

  await Storage.cortex.relax();
})();
