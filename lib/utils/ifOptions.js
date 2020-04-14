"use strict";

function ifOption(dst, src, names) {
  if (!Array.isArray(names))
    names = [names];

  for (let name of names)
    if (Object.prototype.hasOwnProperty.call(src, name))
      dst[name] = src[name];
}
