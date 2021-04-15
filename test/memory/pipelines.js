/**
 * test/memory/pipelines
 */
"use strict";

const _createSchema = require('../lib/_createSchema');
const transfers = require('./transfers');
const codify = require('./codify');
const transforms = require('./transforms');
const { logger } = require('../../storage/utils');

(async () => {

  if (await transfers.runTests())
    return 1;
  if (await codify.runTests())
    return 1;
  if (await transforms.runTests())
    return 1;

})();