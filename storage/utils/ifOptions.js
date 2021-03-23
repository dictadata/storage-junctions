// storage/utils/ifOptions
"use strict";

const { hasOwnProperty } = require("./hasOwnProperty");

function ifOptions(dst, src, names) {
  if (!Array.isArray(names))
    names = [names];

  for (let name of names)
    if (hasOwnProperty(src, name))
      dst[name] = src[name];
}

module.exports = exports = ifOptions;
