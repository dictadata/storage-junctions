"use strict";

const FileSystem = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const { FTP } = require("ftp-ts");
const { PassThrough } = require('stream');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');
const zlib = require('zlib');

const mkdir = util.promisify(fs.mkdir);

module.exports = exports = class ftpFileSystem extends FileSystem {

  /**
   *
   * @param {*} SMT  example "model|ftp:directory|filename|*"
   * @param {*} options  ftp-ts connection options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("ftpFileSystem");

    this._url = new URL(this.smt.locus);
    logger.verbose(JSON.stringify(this._url));

    this._ftp = null;
  }

  /**
   *
   */
  async activate() {
    if (this._isActive)
      return this._ftp;

    this._isActive = true;
    let options = this.options.ftp || {};

    try {
      // connect to host
      this._ftp = await FTP.connect({
        host: options.host || "127.0.0.1",
        port: options.port || 21,
        user: options.user || (this.smt.credentials && this.smt.credentials.user) || 'anonymous',
        password: options.password || (this.smt.credentials && this.smt.credentials.password) || 'anonymous@dictadata',
        secure: Object.prototype.hasOwnProperty.call(options, "secure") ? options.secure : false
      });
    }
    catch (err) {
      logger.error(err);
      this._isActive = false;
    }

    return this._ftp;
  }

  /**
   *
   */
  async relax() {
    this._isActive = false;
    if (this._ftp) await this._ftp.end();
    this._ftp = null;
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
    logger.verbose('ftp-filesystem list');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      let wdPath = this._url.pathname;

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      var ftp = await this.activate();

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      async function scanner(dirpath, relpath, options) {
        logger.debug('scanner');

        // get list
        await ftp.cwd(dirpath + relpath);
        let dirList = await ftp.list();
        for (let entry of dirList) {
          if (entry.type === 'd' && options.recursive) {
            let subpath = relpath + entry.name + '/';
            await scanner(dirpath, subpath, options);
          }
          else if (entry.type === '-' && rx.test(entry.name)) {
            entry.rpath = relpath + entry.name;
            if (options.forEach)
              await options.forEach(entry);

            list.push(entry);
          }
        }
      }

      await scanner(wdPath, "", options);
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
  async createReadStream(options) {
    logger.debug("ftpFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = schema;
      var ftp = await this.activate();

      // create the read stream
      await ftp.cwd(this._url.pathname);

      rs = await ftp.get(filename);

      ///// check for zip
      if (filename.endsWith('.gz')) {
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
  async createWriteStream(options) {
    logger.debug("ftpFileSystem createWriteStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let ws = false;

    try {
      let filename = schema;
      var ftp = await this.activate();

      // create the read stream
      await ftp.cwd(this._url.pathname);

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and ftp reads from passthrough

      if (options.append) {
        this._isNewFile = false;  // should check for existence
        ws.fs_ws_promise = ftp.append(ws, filename);
      }
      else {
        this._isNewFile = true;
        ws.fs_ws_promise = ftp.put(ws, filename);
      }

      ///// check for zip
      if (filename.endsWith('.gz')) {
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

  async download(options) {
    logger.debug("ftp-fileSystem download");

    options = Object.assign({}, this.options, options);
    let result = true;

    try {
      let wdPath = this._url.pathname;
      let src = wdPath + options.name;
      let dest = options.folder + (options.useRPath ? options.rpath : options.name);
      let dirname = path.dirname(dest);
      if (!fs.existsSync(dirname))
        await mkdir(dirname, { recursive: true });
      logger.verbose("  " + src + " >> " + dest);

      // create the read stream
      var ftp = await this.activate();
      await ftp.cwd(wdPath);
      let rs = await ftp.get(options.name);

      // save to local file
      rs.pipe(fs.createWriteStream(dest));
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }

  async upload(options) {
    logger.debug("ftp-fileSystem upload");

    options = Object.assign({}, this.options, options);
    let result = true;

    try {
      let src = options.folder + options.rpath;
      let dest = this._url.pathname + (options.useRPath ? options.rpath : options.name);
      logger.verbose("  " + src + " >> " + dest);

      // upload file
      var ftp = await this.activate();
      let wdPath = path.dirname(dest);
      await ftp.cwd(wdPath);
      await ftp.put(src, options.name);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }

};
