/**
 * test/codex/add_smt
 *
 * Test Outline:
 *   use codex with underlying Elasticsearch junction
 *   add engram definitions for test data sources:
 *     Elasticsearch, MySQL, MSSQL, JSON file
 */
"use strict";

const Storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");
const fs = require('fs');

logger.info("=== Tests: codex store");

var encoding;

async function init() {
  try {
    // activate codex
    let codex = new Storage.Codex({
      smt: "elasticsearch|http://localhost:9200/|dicta_codex|!domain+'_'+name"
    });

    await codex.activate();
    Storage.codex = codex;

    // read foo_schema encoding
    encoding = JSON.parse(fs.readFileSync("./data/input/foo_schema.encoding.json", "utf8"));
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(smt_name, smt) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + smt_name);

    // store encoding
    let entry = new Engram(smt);
    entry.name = smt_name;
    entry.encoding = encoding;
    if (!entry.tags) entry.tags = [];
    entry.tags.push("foo");

    let results = await Storage.codex.store(entry);
    logger.verbose(JSON.stringify(results, null, "  "));
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

async function addAlias(alias, smt_name) {
  let retCode = 0;

  try {
    logger.verbose('=== alias ' + alias);

    // store encoding
    let entry = {
      name: alias,
      type: "alias",
      title: alias,
      description: "alias for " + smt_name,
      source: smt_name,
      tags: [ "foo", "alias" ]
    };

    let results = await Storage.codex.store(entry);
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

  if (await test(
    "jsonfile-foo_schema",
    "json|./data/input/|foofile.json|*"))
    return 1;
  if (await test(
    "elasticsearch-foo_schema",
    "elasticsearch|http://localhost:9200|foo_schema|!Foo"))
    return 1;
  if (await test("mssql-foo_schema",
    "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo"))
    return 1;
  if (await test("mysql-foo_schema",
    "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|=Foo"))
    return 1;

  if (await addAlias("elasticsearch-foo_alias", "elasticsearch-foo_schema"))
    return 1;

  await Storage.codex.relax();
})();
