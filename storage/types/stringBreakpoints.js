// storage/types/stringBreakpoints
"use strict";

/**
 * stringBreakPoints
 *
 * Three "types" of strings: keyword, text, long text (blob)
 *    keywords  - short strings that may be used as index values
 *    text      - short text for titles, descriptions, etc. may be full-text indexed
 *    long text - long text (blob) for documents, articles, etc.
 */
var stringBreakpoints = {
  keyword: 64,
  kw_regex: /[^A-Za-z0-9_\-, ]/, // fails if other characters are found (^)
  text: 4000
  // otherwise long text
};

module.exports = exports = stringBreakpoints;
