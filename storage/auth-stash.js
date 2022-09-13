/**
 * storage/auth_stash.js
 */
"use strict";

const fs = require('fs');

var auth_stash = new Map();

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
  return auth_stash.set(origin(key), auth);
};

exports.has = (key) => {
  return auth_stash.has(origin(key));
};

exports.recall = (key) => {
  return auth_stash.get(origin(key));
};

exports.dull = (key) => {
  return auth_stash.dull(origin(key));
};

exports.load = (filename) => {
  var data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  for (let [ key, value ] of Object.entries(data))
    auth_stash.set(key, value);
};

exports.save = (filename) => {
  let data = {};
  for (let [ key, value ] of auth_stash.entries())
    data[ key ] = value;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};
