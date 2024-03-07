// storage/utils/ifOptions
"use strict";

function ifOptions(dst, src, names) {
  if (!Array.isArray(names))
    names = [names];

  for (let name of names)
    if (Object.hasOwn(src, name))
      dst[name] = src[name];
}

module.exports = exports = ifOptions;
