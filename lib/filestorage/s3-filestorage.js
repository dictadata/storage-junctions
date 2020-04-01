"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const AWS = require("aws-sdk");
const { PassThrough } = require('stream');
const zlib = require('zlib');


module.exports = exports = class s3FileStorage extends FileStorage {

  /**
   *
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);

    this.s3_options = {
      apiVersion: '2006-03-01'
    };

    logger.debug("s3FileStorage");
  }

  async activate() {
    if (this.options.s3) {
      if (this.options.s3.aws_profile)
        this.s3_options.credentials = new AWS.SharedIniFileCredentials({profile: this.options.s3.aws_profile});
    }
    else
      this.options.s3 = {};

    this.isActive = true;
  }

  /**
   * split locus into bucket name and optional path prefix
   */
  splitLocus() {
    let s3path = this.smt.locus.substring(3);  // remove "s3:"
    let bucket = s3path;
    let prefix = '';

    let p = s3path.indexOf('/');
    if (p > 0) {
      // split bucket name and path prefix
      bucket = s3path.substring(0, p);
      prefix = s3path.substring(p + 1);
    }

    if (prefix && !prefix.endsWith('/'))
      prefix = prefix + '/';

    return [ bucket, prefix ];
  }

  /**
   * list
   */
  async list(options) {
    options = Object.assign({}, this.options.list, options);
    let list = [];

    try {
      var s3 = new AWS.S3(this.s3_options);

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 1000
      };

      let filespec = options.schema || this.smt.schema || '*';
      let rx = '(?:^|/)' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

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
          if (!options.recursive && entry.Key.indexOf('/', prefix.length) >= 0)
            continue;  // no recursion, but controls processing longer paths (subfolders)

          if (rx.test(entry.Key)) {
            let filepath = entry.Key.substring(prefix.length);
            if (options.forEach)
              await options.forEach(filepath);
            else
              list.push(filepath);
          }
        }
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    logger.debug("s3FileStorage createReadStream");
    let options = this.options.writer || {};
    let rs = null;

    try {
      var s3 = new AWS.S3(this.s3_options);

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Key: prefix + this.smt.schema
      };

      rs = await s3.getObject(s3params).createReadStream();

      ///// check for zip
      if (s3params.Key.endsWith('.gz')) {
        var gzip = zlib.createGunzip();
        rs.pipe(gzip);
        return gzip;
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    logger.debug("s3FileStorage createWriteStream");
    let options = this.options.writer || {};
    let ws = false;

    try {
      var s3 = new AWS.S3(this.s3_options);

      ws = new PassThrough(); // app writes to passthrough and S3 reads from passthrough
      this.isNewFile = true;  // can't append to S3 objects

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Key: prefix + this.smt.schema,
        Body: ws
      };

      ws.fs_ws_promise = s3.upload(s3params).promise();

      ///// check for zip
      if (s3params.Key.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return ws;
  }

};
