// storage/utils/replace
"use strict";

const { typeOf } = require("./objCopy");

/**
 * text replacement of "${variable}" in tracts
 * @param {Object} src object that contains properties
 * @param {Object} params the parameter values
 * @returns
 */

module.exports = exports = function replace(src, params) {
  let srcType = typeOf(src, true);

  if (srcType === "Object" || srcType === "SMT") {
    for (let [ name, value ] of Object.entries(src))
      src[ name ] = replace(value, params);
  }
  else if (srcType === "Array") {
    for (let i = 0; i < src.length; i++)
      src[ i ] = replace(src[ i ], params);
  }
  else if (srcType === "String") {
    if (src.indexOf("=${") === 0) {
      // replace the entire value, e.g. number, boolean or object
      for (let [ pname, pval ] of Object.entries(params)) {
        if (src.indexOf("=${" + pname + "}") === 0) {
          src = pval;
          break;
        }
      }
    }
    else if (src.indexOf("${") >= 0) {
      // replace values inside a string
      for (let [ pname, pval ] of Object.entries(params)) {
        var regex = new RegExp("\\${" + pname + "}", "g");
        src = src.replace(regex, pval);
      }
    }
  }

  return src;
};
