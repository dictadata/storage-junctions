/**
 * test/elasticsearch
 */
"use strict";

const { Storage } = require("../../storage");
const compare = require("../lib/_compare");
const { logger } = require('../../storage/utils');
const fs = require('fs');

logger.info("=== Tests: elasticsearch");

async function noRefresh() {
  let retCode = 0;

  let junction;
  try {
    logger.info("=== elasticsearch store");
    let smt = "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo";
    junction = await Storage.activate(smt);

    let construct = {
      Foo: 'hundred',
      Bar: 'buckaroos',
      Baz: 1,
      Fobe: 1.1,
      "Dt Test": "10/07/2018",
      enabled: false
    };

    let results = await junction.store(construct);
    logger.verbose(JSON.stringify(results));

    logger.info("=== elasticsearch retrieve");
    results = await junction.retrieve({
      match: {
        "Bar": { 'wc': 'Buck*' }
      },
      order: { "Foo": "asc" }
    });
    logger.verbose(JSON.stringify(results));

    // save and compare results
    let output = './test/data/output/elasticsearch/refresh_NR.json';
    fs.writeFileSync(output, JSON.stringify(results, null, "  "), "utf8");
    let expected = output.replace("output", "expected");
    retCode = compare(expected, output, 2);

    logger.info("=== elasticsearch dull !Foo");
    results = await junction.dull({
      key: 'hundred'
    });
    logger.verbose(JSON.stringify(results));
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    await junction.relax();
  }

  return retCode;
}

async function withRefresh() {
  let retCode = 0;

  let junction;
  try {
    logger.info("=== elasticsearch store");
    let smt = "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo";
    junction = await Storage.activate(smt, { refresh: true });

    let construct = {
      Foo: 'hundred',
      Bar: 'Buckaroos',
      Baz: 1,
      Fobe: 1.1,
      "Dt Test": "10/07/2018",
      enabled: false
    };

    let results = await junction.store(construct);
    logger.verbose(JSON.stringify(results));

    logger.info("=== elasticsearch retrieve");
    results = await junction.retrieve({
      match: {
        "Bar": { 'wc': 'Buck*' }
      },
      order: { "Foo": "asc" }
    });
    logger.verbose(JSON.stringify(results));

    // save and compare results
    let output = './test/data/output/elasticsearch/refresh_WR.json';
    fs.writeFileSync(output, JSON.stringify(results, null, "  "), "utf8");
    let expected = output.replace("output", "expected");
    retCode = compare(expected, output, 2);

    logger.info("=== elasticsearch dull !Foo");
    results = await junction.dull({
      key: 'hundred'
    });
    logger.verbose(JSON.stringify(results));
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    await junction.relax();
  }

  return retCode;
}

(async () => {
  if (await noRefresh()) return 1;
  if (await withRefresh()) return 1;
})();
