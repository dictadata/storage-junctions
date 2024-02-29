/**
 * storage/utils/dot.js
 */
"use strict";

exports.pick = function pick(dotname, construct) {
  let value;
  let names = dotname.split(".");

  try {
    for (let i = 0; i < names.length; i++) {
      if (i === names.length - 1)
        value = construct[ names[ i ] ];
      else
        construct = construct[ names[ i ] ];
    }
  }
  catch (err) {
    // probably couldn't walk path
  }

  return value;
};

exports.assign = function assign(dotname, construct, value) {
  let names = dotname.split(".");

  try {
    for (let i = 0; i < names.length; i++) {
      if (i === names.length - 1)
        construct[ names[ i ] ] = value;
      else {
        if (!Object.prototype.hasOwnProperty.call(construct, names[ i ]))
          construct[ names[ i ] ] = {};
        construct = construct[ names[ i ] ];
      }
    }
  }
  catch (err) {
    // probably couldn't walk path
  }

  return value;
};
