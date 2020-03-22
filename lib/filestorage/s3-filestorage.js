"use strict";

const FileStorage = require("./index");
const zlib = require('zlib');
const { PassThrough } = require('stream');

const AWS = require("aws-sdk");

const { StorageError } = require("../types");

module.exports = exports = class s3FileStorage extends FileStorage {

  /**
   *
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);

    if (SMT.aws_credentials) {
      this.aws_credentials = SMT.aws_credentials;
    }
    if (SMT.aws_profile) {
      let credentials = new AWS.SharedIniFileCredentials({profile: SMT.aws_profile});
      this.aws_credentials = credentials;
    }

    this._logger.debug("s3FileStorage");
  }

  /**
  *
    */
  s3params() {

    let s3path = this._smt.locus.substring(3);  // remove "s3:"
    let bucket = s3path;
    let prefix = '';
    let path = this._smt.schema;

    // split path from bucket name
    let p = s3path.indexOf('/');
    if (p > 0) {
      bucket = s3path.substring(0, p);
      prefix = s3path.substring(p + 1);
    }

    if (prefix && !prefix.endsWith('/') && !path.startsWith('/'))
      prefix = prefix + '/';

    return {
      Bucket: bucket,
      Key: prefix + path
    };
  }

  /**
   * scan
   */
  async scan() {
    let list = [];

    try {
      let s3path = this._smt.locus.substring(3);  // remove "s3:"

      let filespec = this._options.filespec || this._smt.schema;
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      var s3 = new AWS.S3(this.aws_credentials);

      let bucket = s3path;
      let prefix = '';
      let p = s3path.indexOf('/');
      if (p > 0) {
        bucket = s3path.substring(0, p);
        prefix = s3path.substring(p + 1);
      }

      let s3params = {
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 1000
      };

      //var info = await s3.headBucket(s3params).promise();

      let lastKey = '';
      let done = false;
      while (!done) {
        if (lastKey)
          s3params['StartAfter'] = lastKey;
        let data = await s3.listObjectsV2(s3params).promise();
        if (data.Contents.length === 0 || data.Contents.length < s3params.MaxKeys)
          done = true;
        else
          lastKey = data.Contents[data.Contents.length - 1].Key;

        for (let entry of data.Contents) {
          if (entry.Key.charAt(entry.Key.length - 1) === '/')
            continue;  // skip folder names
          if (prefix && entry.Key.indexOf(prefix) !== 0)
            continue;
          if (!this._options.recursive && entry.Key.indexOf('/', prefix.length) >= 0)
            continue;  // no recursion, but controls processing longer paths (subfolders)

          if (entry.Key.match(rx)) {
            if (!this._options.forEach)
              list.push(entry.Key);
            if (this._options.forEach) {
              let relpath = entry.Key.slice(prefix.length);
              await this._options.forEach(relpath);
            }
          }
        }
      }
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }

    return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    this._logger.debug("s3FileStorage createReadStream");
    let rs = null;

    try {
      var s3 = new AWS.S3(this.aws_credentials);

      let params = this.s3params();
      rs = await s3.getObject(params).createReadStream();

      ///// check for zip
      if (params.Key.endsWith('.gz')) {
        var gzip = zlib.createGunzip();
        rs.pipe(gzip);
        return gzip;
      }
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    this._logger.debug("s3FileStorage createWriteStream")
    let ws = false;

    try {
      var s3 = new AWS.S3(this.aws_credentials);

      ws = new PassThrough(); // write to transform and s3.upload reads from transform
      this.isNewFile = true;  // can't append to S3 objects

      let params = this.s3params();
      params['Body'] = ws;
      ws.s3upload = s3.upload(params).promise();

      ///// check for zip
      if (params.Key.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }

    return ws;
  }

};
