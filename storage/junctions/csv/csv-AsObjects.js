/**
 * CsvAsObjects
 *
 * This code module is copied from stream-csv-as-json/AsObjects
 *
 * Should this module be DEPRECATED???
 *
 */
'use strict';

const { Transform } = require('node:stream');

const withParser = require('stream-json/utils/withParser');

class CsvAsObjects extends Transform {
  static make(options) {
    return new CsvAsObjects(options);
  }

  static withParser(options) {
    return withParser(CsvAsObjects.make, options);
  }

  constructor(options) {
    super(Object.assign({}, options, { writableObjectMode: true, readableObjectMode: true }));

    this._header = false;
    this._keys = [];
    this._fieldPrefix = 'field_';
    this._packKeys = true;
    this._streamKeys = true;
    this._buffer = '';
    this._index = 0;

    if (options) {
      'header' in options && (this._header = options.header);
      'keys' in options && (this._keys = options.keys || options.headers);
      'fieldPrefix' in options && (this._fieldPrefix = options.fieldPrefix);
      'packValues' in options && (this._packStrings = options.packValues);
      'packKeys' in options && (this._packKeys = options.packKeys);
      'streamValues' in options && (this._streamStrings = options.streamValues);
      'streamKeys' in options && (this._streamKeys = options.streamKeys);
    }
    !this._packKeys && (this._streamKeys = true);

    if (this._header) {
      this._keys = [];
      this._transform = this._transformHeaderTokens;
    }
    else
      this._transform = this._transformToObject;
    //    else
    //      this._transform = this._transformHeaderValues;
  }

  /**
   * if useStringValues === false
   * @param {*} chunk
   * @param {*} _
   * @param {*} callback
   */
  _transformHeaderTokens(chunk, _, callback) {

    switch (chunk.name) {
      case 'endArray':
        // at end of first row switch to transfer method
        this._transform = this._transformToObject;
        break;
      case 'stringChunk':
        this._buffer += chunk.value;
        break;
      case 'endString':
        if (this._buffer.charCodeAt(0) === 0xFEFF)  // BOM character
          this._keys.push(this._buffer.substring(1));
        else
          this._keys.push(this._buffer);
        this._buffer = '';
        break;
    }
    callback();
  }

  /**
   * if useStringValues === true
   * @param {*} chunk
   * @param {*} _
   * @param {*} callback
   */
  _transformHeaderValues(chunk, _, callback) {
    switch (chunk.name) {
      case 'endArray':
        // at end of first row switch to transfer method
        this._transform = this._transformToObject;
        break;
      case 'stringValue':
        this._keys.push(chunk.value);
        break;
    }
    callback();
  }

  _transformToObject(chunk, encoding, callback) {
    let key;
    switch (chunk.name) {
      case 'startArray':
        this.push({ name: 'startObject' });
        break;
      case 'endArray':
        this.push({ name: 'endObject' });
        this._index = 0;
        break;
      case 'startString':
      case 'stringValue':
        key = (this._index < this._keys.length && this._keys[ this._index ]) || this._fieldPrefix + this._index;
        ++this._index;
        if (this._streamKeys) {
          this.push({ name: 'startKey' });
          this.push({ name: 'stringChunk', value: key });
          this.push({ name: 'endKey' });
        }
        this._packKeys && this.push({ name: 'keyValue', value: key });
        if (chunk.name === 'startString') {
          this._transform = this._passString;
          return this._transform(chunk, encoding, callback);
        }
        this.push(chunk);
        break;
    }
    callback();
  }

  _passString(chunk, _, callback) {
    if (this._expected) {
      const expected = this._expected;
      this._expected = '';
      this._transform = this._transformToObject;
      if (expected === chunk.name) {
        this.push(chunk);
      } else {
        return this._transform(chunk, _, callback);
      }
    } else {
      this.push(chunk);
      if (chunk.name === 'endString') {
        this._expected = 'stringValue';
      }
    }
    callback();
  }
}

CsvAsObjects.CsvAsObjects = CsvAsObjects.make;
CsvAsObjects.make.Constructor = CsvAsObjects;

module.exports = exports = CsvAsObjects;
