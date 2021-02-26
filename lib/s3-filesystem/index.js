// filesystems/s3-filesystem
"use strict";

const StorageFileSystem = require("../storage-filesystem");
const { StorageError } = require("../types");
const logger = require("../logger");

const AWS = require("aws-sdk");
const { PassThrough } = require('stream');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const url = require('url');
const zlib = require('zlib');


module.exports = exports = class S3FileSystem extends StorageFileSystem {

  /**
   *
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("S3FileSystem");

    this.s3_options = {
      apiVersion: '2006-03-01'
    };

    this._dirname = ''; // last local directory
  }

  async activate() {
    if (this.options.s3) {
      if (this.options.s3.aws_profile)
        this.s3_options.credentials = new AWS.SharedIniFileCredentials({ profile: this.options.s3.aws_profile });
    }
    else
      this.options.s3 = {};

    this._isActive = true;
  }

  /**
   * split locus into bucket name and optional path prefix
   */
  splitLocus() {
    //let s3path = this.smt.locus.substring(this._fstlen);  // remove "s3:"
    let s3path = this._url.pathname;
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

    return [bucket, prefix];
  }

  /**
   * list
   */
  async list(options) {
    logger.debug('s3-filesystem list');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      var s3 = new AWS.S3(this.s3_options);

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 1000
      };

      let filespec = schema || '*';
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
            entry.name = path.basename(entry.Key);
            entry.rpath = entry.Key.substring(prefix.length);
            Object.defineProperty(entry, 'size', Object.getOwnPropertyDescriptor(entry, 'Size'));
            Object.defineProperty(entry, 'date', Object.getOwnPropertyDescriptor(entry, 'LastModified'));
            delete entry['Size'];
            delete entry['LastModified'];

            if (options.forEach)
              await options.forEach(entry);

            list.push(entry);
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

  async dull(options) {
    logger.debug('s3-filesystem dull');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    try {
      var s3 = new AWS.S3(this.s3_options);

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Key: prefix + schema
      };

      let rs = await s3.deleteObject(s3params);
    }
    catch (err) {
      logger.error(err);
      return err.message;
    }

    return "ok";
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("S3FileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      var s3 = new AWS.S3(this.s3_options);

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Key: prefix + schema
      };

      rs = await s3.getObject(s3params).createReadStream();

      ///// check for zip
      if (s3params.Key.endsWith('.gz')) {
        var gzip = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
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
  async createWriteStream(options) {
    logger.debug("S3FileSystem createWriteStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let ws = null;

    try {
      var s3 = new AWS.S3(this.s3_options);

      ws = new PassThrough(); // app writes to passthrough and S3 reads from passthrough
      this._isNewFile = true;  // can't append to S3 objects

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Key: prefix + schema,
        Body: ws
      };

      ws.fs_ws_promise = s3.upload(s3params).promise();
      // ws.fs_ws_promise is an added property. Used so that StorageWriters 
      // using filesystems know when a transfer is complete.

      ///// check for zip
      if (s3params.Key.endsWith('.gz')) {
        var gzip = zlib.createGzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
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

  async download(options) {
    logger.debug("s3-filesystem download");
    options = Object.assign({}, this.options, options);
    let result = true;

    try {
      let src = options.Key;
      let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));
      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      var s3 = new AWS.S3(this.s3_options);

      let [bucket, prefix] = this.splitLocus();
      let s3params = {
        Bucket: bucket,
        Key: src
      };

      let rs = await s3.getObject(s3params).createReadStream();

      // save to local file
      rs.pipe(fs.createWriteStream(dest));
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return true;
  }

  async upload(options) {
    logger.debug("s3-filesystem upload");
    options = Object.assign({}, this.options, options);
    let result = true;

    try {
      let [bucket, prefix] = this.splitLocus();
      let src = path.join(options.uploadPath, options.rpath);
      let dest = prefix + (options.useRPath ? options.rpath : options.name).split(path.sep).join(path.posix.sep);
      logger.verbose("  " + src + " >> " + dest);

      // upload file
      let ws = fs.createReadStream(src);
      this._isNewFile = true;  // can't append to S3 objects

      var s3 = new AWS.S3(this.s3_options);
      let s3params = {
        Bucket: bucket,
        Key: dest,
        Body: ws
      };

      await s3.upload(s3params).promise();
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }

};
