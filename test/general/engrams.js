/**
 * test/general/engram
 */
"use strict";

const { Storage } = require('../../storage');
const { logger } = require('@dictadata/lib');
const fs = require('node:fs');

logger.info("=== Tests: echo encodings");

async function test(schema) {
  let retCode = 0;

  var jo;
  var encoding;
  try {
    logger.verbose('=== ' + schema);
    jo = await Storage.activate("*|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/_data/input/engrams/" + schema + ".engram.json", "utf8"));
    jo.encoding = encoding;
    encoding = jo.encoding;
    //logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./test/_data/output/" + schema + ".engram.json", JSON.stringify(encoding, null, 2), "utf8");
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }
  finally {
    if (jo) jo.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test("foo_schema")) return 1;
  if (await test("foo_schema_short")) return 1;
  if (await test("foo_schema_typesonly")) return 1;
})();
