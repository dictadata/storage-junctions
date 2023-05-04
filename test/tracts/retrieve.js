/**
 * test/tracts/retrieve
 *
 * Test Outline:
 *   use tracts with Elasticsearch junction
 *   retreive all entries starting with foo_transfer*
 *   compare results to expected tracts entries
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("../lib/_compare");

const fs = require('fs');
const path = require('path');

logger.info("=== Tests: tracts retrieve");

async function init() {
  try {
    // activate tracts
    let tracts = new Storage.Tracts("elasticsearch|http://dev.dictadata.net:9200/|dicta_tracts|*");
    await tracts.activate();
    Storage.tracts = tracts;
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(tract_name) {
  let retCode = 0;

  try {
    logger.verbose('=== retrieve ' + tract_name);

    // retrieve tracts entries
    let results = await Storage.tracts.retrieve({
      match: {
        "name": {
          wc: tract_name + "*"
        }
      }
    });

    let outputfile = "./data/output/tracts/retrieve_" + tract_name + ".tract.json";
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

  await Storage.tracts.relax();
})();
