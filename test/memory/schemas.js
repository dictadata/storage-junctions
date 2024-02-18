/**
 * test/memory/schemas
 */
"use strict";

const createSchema = require('./createSchema');
const dullSchema = require('./dullSchema');
const getEngram = require('./getEngram');
const list = require("./list");

(async () => {
  if (await createSchema.runTests())
    return 1;

  if (await dullSchema.runTests())
    return 1;
  if (await getEngram.runTests())
    return 1;
  if (await list.runTests())
    return 1;

})();
