/**
 * test/tracts/store
 *
 * Test Outline:
 *   use tracts with Elasticsearch junction
 *   read tract definition from file
 *   store tract definition in tracts
 */
"use strict";

const Storage = require("../../storage");
const { logger } = require("../../storage/utils");
const fs = require('fs');

logger.info("=== Tests: tracts store");

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

async function store(tract_name) {
  let retCode = 0;

  let entry;
  try {
    logger.verbose('=== store ' + tract_name);

    entry = JSON.parse(fs.readFileSync("./data/input/tracts/" + tract_name + ".tract.json", "utf8"));
    entry.name = tract_name;

    if (!entry.tags) {
      entry.tags = [];
      entry.tags.push("foo");
    }

    let results = await Storage.tracts.store(entry);
    logger.verbose(JSON.stringify(results, null, "  "));
  }
  catch (err) {
    logger.error(err);
    retCode = 1;
  }

  return process.exitCode = retCode;
}

async function alias(alias, urn) {
  let retCode = 0;

  try {
    logger.verbose('=== alias ' + alias);

    // store alias entry
    let entry = {
      domain: "foo",
      name: alias,
      type: "alias",
      title: alias,
      description: "alias for " + urn,
      source: urn,
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

  if (await store("foo_transfer")) return 1;
  if (await store("foo_transfer_two")) return 1;

  if (await alias("foo_alias", "foo:foo_transfer")) return 1;

  await Storage.tracts.relax();
})();
