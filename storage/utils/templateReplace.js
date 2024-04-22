// storage/utils/templates.js
"use strict";

/// DEPRECATED  use replace.js

const templateRx = /\$\{\s?([^{}\s]*)\s?\}/g;

/**
 * string template style replacement
 *  template: "a string ${value1} ${cnt} ${value3}"
 *  params: { value1: "with", cnt: 3, value3: "replacements"}
 *  returns: "a string with 3 replacements"
 * @param {string} template a string containing replacement expressions of form ${name}
 * @param {object} params params of replacement values, i.e. params: { name: value }
 */
function stringReplace(template, params) {
  // find and replace all ${xxx} values in template string
  let text = template.replace(templateRx, (matched, name) => {
    if (Object.hasOwn(params, name))
      return params[ name ];
    else
      return matched;
  });
  return text;
}

/**
 * loop through an object running replacement on all string properties
 * @param {Object|Array|String} template source containing replacement expressions of form ${name}
 * @param {object} params object containing replacement values, i.e. params: { name: value }
 */
function replace(template, params) {
  if (template)
    throw "templateReplace DEPRECATED";

  if (typeof template === "string") {
    return stringReplace(template, params);
  }
  else if (Array.isArray(template)) {
    for (let i = 0; i < template.length; i++)
      template[ i ] = replace(template[ i ], params);
  }
  else if (typeof template === "object") {
    for (let [ name, value ] of Object.entries(template)) {
      template[ name ] = replace(value, params);
    }
  }
  return template;
}

module.exports = exports = replace;
