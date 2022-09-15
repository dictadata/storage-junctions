/**
 * test/codex/store
 *
 * Test Outline:
 *   use codex with Elasticsearch junction
 *   read engram(s) from file
 *   store engram(s) in codex
 */
"use strict";

const Storage = require("../../storage");
const { Engram } = require("../../storage/types");
const { logger } = require("../../storage/utils");
const fs = require('fs');

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

async function store(schema) {
  let retCode = 0;

  let encoding;
  try {
    logger.verbose('=== ' + schema);

    // store encoding
    encoding = JSON.parse(fs.readFileSync("./data/input/" + schema + ".encoding.json", "utf8"));
    encoding.name = schema;

    let entry = new Engram(encoding);

    if (!entry.tags) {
      entry.tags = [];
      entry.tags.push("foo");
    }

    let results = await Storage.codex.store(entry);
    logger.verbose(JSON.stringify(results, null, "  "));
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

async function alias(alias, smt_urn) {
  let retCode = 0;

  try {
    logger.verbose('=== ' + alias);

    // store alias entry
    let entry = {
      domain: "foo",
      name: alias,
      type: "alias",
      title: alias,
      description: "alias for " + smt_urn,
      source: smt_urn,
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

  if (await store("foo_schema")) return 1;
  if (await store("foo_schema_short")) return 1;
  if (await store("foo_schema_typesonly")) return 1;
  if (await store("foo_schema_two")) return 1;

  if (await alias("foo_alias", "foo_schema")) return 1;

  await Storage.codex.relax();
})();
