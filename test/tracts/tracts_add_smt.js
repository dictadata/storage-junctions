/**
 * test/tracts/add_smt
 *
 * Test Outline:
 *   use tracts with underlying Elasticsearch junction
 *   add engram definitions for test data sources:
 *     Elasticsearch, MySQL, MSSQL, JSON file
 */
"use strict";

const Storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");
const fs = require('fs');

logger.info("=== Tests: tracts store");

var encoding;

async function init() {
  try {
    // activate tracts
    let tracts = new Storage.Tracts("elasticsearch|http://dev.dictadata.net:9200/|dicta_tracts|*");
    await tracts.activate();
    Storage.tracts = tracts;

    // read foo_schema encoding
    encoding = JSON.parse(fs.readFileSync("./data/input/foo_schema.encoding.json", "utf8"));
  }
  catch (err) {
    logger.error(err);
  }
}

async function test(name, smt) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + name);

    // store encoding
    let entry = new Engram(smt);
    entry.domain = "foo";
    entry.name = name;
    entry.encoding = encoding;
    if (!entry.tags) entry.tags = [];
    entry.tags.push("foo");

    let results = await Storage.tracts.store(entry);
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

    let results = await Storage.tracts.store(entry);
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
    "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"))
    return 1;
  if (await test("mssql-foo_schema",
    "mssql|server=dev.dictadata.net;database=storage_node|foo_schema|=Foo"))
    return 1;
  if (await test("mysql-foo_schema",
    "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|=Foo"))
    return 1;

  if (await addAlias("elasticsearch-foo_alias", "foo:elasticsearch-foo_schema"))
    return 1;

  await Storage.tracts.relax();
})();
