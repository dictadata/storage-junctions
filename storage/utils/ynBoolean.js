/**
 * ynBoolean - utility to determine if a value is boolean representation
 *
 * extracted from https://github.com/sindresorhus/yn
 */
'use strict';

module.exports = exports = (value, { default: _default } = {}) => {
  if (_default !== undefined && typeof _default !== 'boolean') {
    throw new TypeError(`Expected the \`default\` option to be of type \`boolean\`, got \`${typeof _default}\``);
  }

  if (value === undefined || value === null) {
    return _default;
  }

  value = String(value).trim();

  if (/^(?:y|yes|true|1|on)$/i.test(value)) {
    return true;
  }

  if (/^(?:n|no|false|0|off)$/i.test(value)) {
    return false;
  }

  return _default;
};
