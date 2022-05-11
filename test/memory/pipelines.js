/**
 * test/memory/pipelines
 */
"use strict";

const transfers = require('./transfers');
const codify = require('./codify');
const transforms = require('./transforms');

(async () => {

  if (await transfers.runTests())
    return 1;
  if (await codify.runTests())
    return 1;
  if (await transforms.runTests())
    return 1;

})();
