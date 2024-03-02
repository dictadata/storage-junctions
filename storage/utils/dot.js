/**
 * storage/utils/dot.js
 */
"use strict";

exports.get = function get(dotname, construct) {
  let props = dotname.split('.');

  let prop;
  try {
    prop = props.reduce((prop, name) => prop[ name ], construct);
  }
  catch (err) {
    console.warn(err.message);
  }

  return prop;
};

exports.set = function set(dotname, construct, value) {
  let names = dotname.split(".");
  let vname = names.pop();

  let prop = construct;
  try {
    for (let name of names) {
      if (!Object.prototype.hasOwnProperty.call(prop, name))
        prop[ name ] = {};
      prop = prop[ name ];
    }
  }
  catch (err) {
    console.warn(err.message);
  }

  if (typeof prop !== "object")
    return false;

  prop[ vname ] = value;
  return true;
};
