// storage/types/stringBreakpoints
"use strict";

/**
 * stringBreakPoints
 * 
 * Three "types" of strings: keyword, string, blobText
 *    keywords   - short strings that may be used as index values
 *    short text - used for titles, descriptions, etc. may be full-text indexed
 *    long text  - large strings for documents, articles, etc.
 */
var stringBreakpoints = {
  keyword: 64,
  text: 4000
  // otherwise long text
};

module.exports = exports = stringBreakpoints;
