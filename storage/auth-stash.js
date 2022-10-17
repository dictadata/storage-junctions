/**
 * storage/auth_stash.js
 */
"use strict";

const fs = require('fs');

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
  var data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  for (let [ key, value ] of Object.entries(data))
    _stash.set(key, value);
};

exports.save = (filename) => {
  let data = {};
  for (let [ key, value ] of _stash.entries())
    data[ key ] = value;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
};