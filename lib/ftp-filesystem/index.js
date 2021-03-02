// filesystems/ftp-filesystem
"use strict";

const StorageFileSystem = require("../storage-filesystem");
const { hasOwnProperty, StorageError } = require("../types");
const logger = require("../logger");

const FTP = require("promise-ftp");
const { PassThrough } = require('stream');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const url = require('url');
const util = require('util');
const zlib = require('zlib');


module.exports = exports = class FtpFileSystem extends StorageFileSystem {

  /**
   *
   * @param {*} SMT  example "model|ftp://username:password@host/directory/|filespec|*"
   * @param {*} options  ftp-ts connection options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("FtpFileSystem");

    this._ftp = new FTP();

    this._dirname = '';  // last local dir
    this._curdir = '';   // last ftp dir
  }

  /**
   *
   */
  async activate() {
    console.log("activate");
    const options = this.options.ftp || {};

    // connect to host
    await this._ftp.connect({
      host: this._url.host || "127.0.0.1",
      port: this._url.port || 21,
      user: this._url.username || (this.smt.credentials && this.smt.credentials.user) || 'anonymous',
      password: this._url.password || (this.smt.credentials && this.smt.credentials.password) || 'anonymous@dictadata',
      secure: hasOwnProperty(options, "secure") ? options.secure : false
    });

    this._isActive = true;
    console.log("activated");
  }

  /**
   *
   */
  async relax() {
    if (this._isActive) {
      this._isActive = false;
      await this._ftp.end();
    }
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
    logger.debug('ftp-filesystem list');

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

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      let ftp = this._ftp;
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

  async dull(options) {
    logger.debug('ftp-filesystem dull');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    try {
      let filename = this._url.pathname + schema;
      await this._ftp.delete(filename);
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
    logger.debug("FtpFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = schema;

      // create the read stream
      await this._ftp.cwd(this._url.pathname);

      rs = await this._ftp.get(filename);

      ///// check for zip
      if (filename.endsWith('.gz')) {
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
    logger.debug("FtpFileSystem createWriteStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let ws = false;

    try {
      let filename = schema;

      // create the read stream
      await this._walkCWD(this._url.pathname);

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and ftp reads from passthrough

      if (options.append) {
        this._isNewFile = false;  // should check for existence
        ws.fs_ws_promise = this._ftp.append(ws, filename);
      }
      else {
        this._isNewFile = true;
        ws.fs_ws_promise = this._ftp.put(ws, filename);
      }
      // ws.fs_ws_promise is an added property. Used so that StorageWriters 
      // using filesystems know when a transfer is complete.

      ///// check for zip
      if (filename.endsWith('.gz')) {
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
    logger.debug("ftp-fileSystem download");

    options = Object.assign({}, this.options, options);
    let result = true;

    try {
      let wdPath = this._url.pathname + (options.recursive ? path.dirname(options.rpath) : '');
      let src = wdPath + (options.recursive ? options.rpath : options.name);
      let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));
      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      // create the read stream
      await this._ftp.cwd(wdPath);
      let rs = await this._ftp.get(options.name);

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
      let src = path.join(options.uploadPath, options.rpath);
      let dest = this._url.pathname + (options.useRPath ? options.rpath : options.name).split(path.sep).join(path.posix.sep);
      logger.verbose("  " + src + " >> " + dest);

      // upload file
      let wdPath = path.dirname(dest);
      await this._walkCWD(wdPath);
      await this._ftp.put(src, options.name);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }


  async _walkCWD(path) {
    if (path === this._curdir)
      return;
    else
      this._curdir = path;

    let elements = path.split('/');
    let rc = 0;

    rc = await this._cwd('/');
    for (let dir of elements) {
      rc = await this._cwd(dir);
      if (rc !== 0) {
        rc = await this._mkdir(dir);
        if (rc === 0)
          rc = await this._cwd(dir);
      }

      if (rc !== 0)
        throw new StorageError("Could not walk ftp directory: " + rc);
    }
  }

  async _cwd(path) {
    try {
      await this._ftp.cwd(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

  async _mkdir(path) {
    try {
      await this._ftp.mkdir(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

};
