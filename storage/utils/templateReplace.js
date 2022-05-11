// storage/utils/templates.js
"use strict";

/**
 * string template style replacement
 *  template: "a string ${value1} ${cnt} ${value3}"
 *  source: { value1: "with", cnt: 3, value3: "replacements"}
 *  returns: "a string with 3 replacements"
 * @param {*} template a string containing replacement expressions of form ${propname}
 * @param {*} source source of replacement values, i.e. source[propname]
 */
function stringReplace(template, source) {
  const templateMatcher = /\$\{\s?([^{}\s]*)\s?\}/g;
  let text = template.replace(templateMatcher, (matched, p1) => {
    if (Object.prototype.hasOwnProperty.call(source, p1))
      return source[ p1 ];
    else
      return matched;
  });
  return text;
}

/**
 * loop through an object running replacement on all string properties
 * @param {*} template
 * @param {*} source
 */
function templateReplace(template, source) {
  if (typeof template === "string") {
    return stringReplace(template, source);
  }
  else if (Array.isArray(template)) {
    for (let i = 0; i < template.length; i++)
      template[ i ] = templateReplace(template[ i ], source);
  }
  else if (typeof template === "object") {
    for (let [ name, value ] of Object.entries(template)) {
      template[ name ] = templateReplace(value, source);
    }
  }
  return template;
}

module.exports = exports = templateReplace;
