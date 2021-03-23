// storage/types/StorageResults
"use strict";

/**
 * The results type returned by storage methods. Note encoding methods return an Engram object.
 * @param {string} result a string with a textual result code
 * @param {*} data a raw data object or array of data objects
 * @param {*} key the key or array of keys, for keystores storage sources
 * @param {*} _meta extra information from the storage source, if the source provides info
 */
function StorageResults (result, data = null, key = null, _meta = null) {
  this.result = result;

  if (key) {
    this.data = {};
    if (typeof key === "string")
      this.data[key] = data;
  }
  else if (data) {
    this.data = Array.isArray(data) ? data : [data];
  }
  else
    this.data = [];
  if (_meta)
    this._meta = _meta;
}

StorageResults.prototype.add = function (data, key = null, _meta = null) {
  if (key) {
    if (!this.data)
      this.data = {};
    this.data[key] = data;
  }
  else {
    if (Array.isArray(data))
      this.data = data;
    else {
      if (!this.data)
        this.data = [];
      this.data.push(data);
    }
  }

  if (!_meta)
    this._meta = _meta;
  else if (key)
    this._meta[key] = _meta;
  else if (this._meta.data)
    this._meta.data.push(_meta);
};

module.exports = exports = StorageResults;
