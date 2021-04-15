/**
 * test/memory/schemas
 */
"use strict";

const createSchema = require('./createSchema');
const dullSchema = require('./dullSchema');
const getEncoding = require('./getEncoding');
const list = require("./list");

(async () => {
  if (await createSchema.runTests())
    return 1;

  if (await dullSchema.runTests())
    return 1;
  if (await getEncoding.runTests())
    return 1;
  if (await list.runTests())
    return 1;

})();
