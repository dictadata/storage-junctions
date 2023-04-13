/**
 * storage/auth_stash.js
 */
"use strict";

const fs = require('fs');
const homedir = require('os').homedir();

var _stash = new Map();

function origin(key) {
  if (key instanceof URL)
    return key.origin;
  else if (typeof key === "string" && key.indexOf('://') >= 0) {
    let url = new URL(key);
    return url.origin;
  }
  else
    return key;
}

exports.store = (key, auth) => {
  return _stash.set(origin(key), auth);
};

exports.has = (key) => {
  return _stash.has(origin(key));
};

exports.recall = (key) => {
  return _stash.get(origin(key));
};

exports.dull = (key) => {
  return _stash.dull(origin(key));
};

exports.load = (filename) => {
  // file format:
  // { key: options, ... }
  // where key is a connection string
  // where options is an object with connection options
  try {
    var connections = JSON.parse(fs.readFileSync(filename, 'utf8'));

    for (let [ key, options ] of Object.entries(connections)) {
      // check to read certificate authorities from file
      let ca = (options.ssl && options.ssl.ca) || (options.tls && options.tls.ca) || null;
      if (typeof ca === "string" && !ca.startsWith("-----BEGIN CERTIFICATE-----")) {
        // assume it's a filename
        if (ca.startsWith("~"))
          ca = homedir + ca.substring(1);
        ca = fs.readFileSync(ca);
      }

      _stash.set(key, options);
    }
  }
  catch (err) {
    console.warn(err.message);
  }
};

exports.save = (filename) => {
  try {
    let data = {};
    for (let [ key, value ] of _stash.entries())
      data[ key ] = value;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
  }
  catch (err) {
    console.warn(err.message);
  }

};
