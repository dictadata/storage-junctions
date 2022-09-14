/**
 * storage/codex_auth.js
 */
"use strict";

const fs = require('fs');

var codex_auth = new Map();

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
  return codex_auth.set(origin(key), auth);
};

exports.has = (key) => {
  return codex_auth.has(origin(key));
};

exports.recall = (key) => {
  return codex_auth.get(origin(key));
};

exports.dull = (key) => {
  return codex_auth.dull(origin(key));
};

exports.load = (filename) => {
  var data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  for (let [ key, value ] of Object.entries(data))
    codex_auth.set(key, value);
};

exports.save = (filename) => {
  let data = {};
  for (let [ key, value ] of codex_auth.entries())
    data[ key ] = value;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};
