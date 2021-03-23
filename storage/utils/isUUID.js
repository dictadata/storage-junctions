// storage/utils/isUUID
"use strict";

/**
 * Returns true if value is a valid string form of a UUID
 * @param {*} value a string
 */
function isUUID (value) {
  if (!value || typeof value !== "string")
    return false;

  var validLen = [36,32,38,40];
  if (!validLen.includes(value.length))
    return false;

  // normal 8-4-4-4-12
  if (/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(value))
    return true;
  // without dashes
  if (/[0-9a-fA-F]{32}/.test(value))
    return true;
  // old microsoft style with {} braces
  if (/\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}/.test(value))
    return true;
  // SHA-1 digest
  if (/[0-9a-fA-F]{40}/.test(value))
    return true;

  return false;
};

module.exports = exports = isUUID;
