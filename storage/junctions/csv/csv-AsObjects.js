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

  /**
   *
   * @param {*} options
   * @param {boolean}  options.hasHeader input includes a header row, default false
   * @param {string[]} options.headers values to use for field names, default undefined
   */
  constructor(options) {
    super({ objectMode: true });

    this._hasHeader = false;
    this._headers = [];
    this._csvHeaders = [];
    this._fieldPrefix = 'field_';
    this._packKeys = true;
    this._streamKeys = true;
    this._buffer = '';
    this._index = 0;

    if (options) {
      if ('hasHeader' in options) this._hasHeader = options.hasHeader;
      if ('headers' in options) this._headers = options.headers;
      if ('keys' in options) this._headers = options.keys;
      if ('fieldPrefix' in options) this._fieldPrefix = options.fieldPrefix;
      if ('packValues' in options) this._packStrings = options.packValues;
      if ('packKeys' in options) this._packKeys = options.packKeys;
      if ('streamValues' in options) this._streamStrings = options.streamValues;
      if ('streamKeys' in options) this._streamKeys = options.streamKeys;
    }
    if (!this._packKeys) this._streamKeys = true;

    if (this._hasHeader) {
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
          this._csvHeaders.push(this._buffer.substring(1));
        else
          this._csvHeaders.push(this._buffer);
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
        this._csvHeaders.push(chunk.value);
        break;
    }
    callback();
  }

  _transformToObject(chunk, encoding, callback) {
    let headers = this._headers.length ? this._headers : (this._csvHeaders.length ? this._csvHeaders : []);
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
        key = (this._index < headers?.length && headers[ this._index ]) || (this._fieldPrefix + this._index);
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
