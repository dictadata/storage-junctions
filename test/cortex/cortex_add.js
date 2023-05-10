/**
 * test/cortex/cortex_add
 *
 * Test Outline:
 *   use cortex with underlying Elasticsearch junction
 *   add tract definitions for test transfers
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const fs = require('fs');

logger.info("=== Tests: cortex add");

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
    logger.verbose('=== store ' + tract_name);

    // store tract
    let entry = JSON.parse(fs.readFileSync("./data/input/tracts/" + tract_name + ".tract.json", "utf8"));
    entry.name = tract_name;

    entry.domain = "foo";
    entry.name = tract_name;
    if (!entry.tags)
      entry.tags = [];
    entry.tags.push("foo");

    let results = await Storage.cortex.store(entry);
    logger.verbose(JSON.stringify(results, null, "  "));
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

async function addAlias(alias, source) {
  let retCode = 0;

  try {
    logger.verbose('=== alias ' + alias);

    // store encoding
    let entry = {
      domain: "foo",
      name: alias,
      type: "alias",
      title: alias,
      description: "alias for " + source,
      source: source,
      tags: [ "foo", "alias" ]
    };

    let results = await Storage.cortex.store(entry);
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

  if (await test("jsonfile-foo_transfer"))
    return 1;
  if (await test("elasticsearch-foo_transfer"))
    return 1;
  if (await test("mssql-foo_transfer"))
    return 1;
  if (await test("mysql-foo_transfer"))
    return 1;

  if (await addAlias("elasticsearch-foo_alias", "foo:elasticsearch-foo_transfer"))
    return 1;

  await Storage.cortex.relax();
})();
