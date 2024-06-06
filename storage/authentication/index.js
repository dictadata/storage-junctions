/**
 * storage/authentication
 */
"use strict";
const { logger } = require("@dictadata/lib");
const fs = require('node:fs');
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

var _credentials = new Map();
exports._credentials = _credentials;

/**
 * if a URL then pick out the server.
 * @param {*} key
 * @returns
 */
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
  return _credentials.set(origin(key), auth);
};

exports.has = (key) => {
  return _credentials.has(origin(key));
};

exports.recall = (key) => {
  return _credentials.get(origin(key));
};

exports.dull = (key) => {
  return _credentials.dull(origin(key));
};

exports.load = (filename) => {

  try {
    var entries = JSON.parse(fs.readFileSync(filename, 'utf8'));

    for (let entry of entries) {
      // check to read certificate authorities from file
      let tls = entry.tls || entry.ssl;
      if (tls?.ca) {
        if (typeof tls.ca === "string" && !tls.ca.startsWith("-----BEGIN CERTIFICATE-----")) {
          // assume it's a filename
          if (tls.ca.startsWith("~"))
            tls.ca = homedir + tls.ca.substring(1);

          // replace ca with contents of file
          logger.verbose("ca: " + tls.ca);
          tls.ca = fs.readFileSync(tls.ca);
        }
      }

      _credentials.set(entry.locus, entry);
    }
  }
  catch (err) {
    console.warn(err.message);
  }
};

exports.save = (filename) => {
  try {
    let data = [];
    for (let value of _credentials.values())
      data.push(value);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
  }
  catch (err) {
    console.warn(err.message);
  }

};
