// storage/utils/replace
"use strict";

const typeOf = require("./typeOf");

/**
 * Text replacement of "${name}" in template's string properties.
 * Will recurse through objects and arrays.
 * @param {Object|Array|String} template source containing template expressions of form ${name}
 * @param {object} params object containing replacement values, i.e. params: { name: value }
 * @returns the template object with any replacements
 */
module.exports = exports = function replace(template, params) {
  let rx = new RegExp(/\$\{\s?([^{}\s]+)\s?\}/g);
  let srcType = typeOf(template, true);

  if (srcType === "Object" || srcType === "SMT") {
    for (let [ name, value ] of Object.entries(template))
      template[ name ] = replace(value, params);
  }
  else if (srcType === "Array") {
    for (let i = 0; i < template.length; i++)
      template[ i ] = replace(template[ i ], params);
  }
  else if (srcType === "String") {
    if (template.indexOf("=${") === 0) {
      // replace the entire value, e.g. number, boolean, object, ...
      let results = rx.exec(template);
      if (results && Object.hasOwn(params, results[1]))
        template = params[ results[ 1 ] ];
    }
    else {
      // replace values inside string, if any
      template = template.replace(rx, (matched, name) => {
        if (Object.hasOwn(params, name))
          return params[ name ];
        else
          return matched; // original value
      });
    }
  }

  return template;
};
