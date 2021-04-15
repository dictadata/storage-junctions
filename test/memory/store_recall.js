/**
 * test/memory/store_recall
 */
"use strict";

const _createSchema = require('../lib/_createSchema');
const store = require("./store");
const recall = require("./recall");
//const retrieve = require("./retrieve");
//const aggregate = require('./aggregate');
const dull = require("./dull");
const { logger } = require('../../storage/utils');

(async () => {

  logger.info("=== createSchema foo_schema");
  if (await _createSchema({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo",
      options: {
        encoding: "./data/test/encoding_foo.json"
      }
    }
  })) return 1;

  if (await store.runTests()) return 1;
  if (await recall.runTests()) return 1;
  //if (await retrieve.runTests()) return 1;
  //if (await aggregate.runTests()) return 1;
  if (await dull.runTests()) return 1;

})();
