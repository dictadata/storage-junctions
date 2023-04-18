/**
 * storage/auth_stash.js
 */
"use strict";
const { logger } = require("./utils");
const fs = require('fs');
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

var _stash = new Map();
exports._stash = _stash;

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
      let tls = options.tls || options.ssl;
      if (tls && tls.ca) {
        if (typeof tls.ca === "string" && !tls.ca.startsWith("-----BEGIN CERTIFICATE-----")) {
          // assume it's a filename
          if (tls.ca.startsWith("~"))
            tls.ca = homedir + tls.ca.substring(1);

          // replace ca with contents of file
          logger.verbose("ca: " + tls.ca);
          tls.ca = fs.readFileSync(tls.ca);
        }
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
