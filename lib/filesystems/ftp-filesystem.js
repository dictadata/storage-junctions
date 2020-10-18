"use strict";

const FileSystem = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const FTP = require("ftp");
const { PassThrough } = require('stream');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');
const zlib = require('zlib');

const mkdir = util.promisify(fs.mkdir);

module.exports = exports = class FtpFileSystem extends FileSystem {

  /**
   *
   * @param {*} SMT  example "model|ftp://username:password@host/directory/|filespec|*"
   * @param {*} options  ftp-ts connection options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("FtpFileSystem");

    this._ftp = new FTP();
    this._ftp._cwd = util.promisify(this._ftp.cwd);
    this._ftp._mkdir = util.promisify(this._ftp.mkdir);
    this._ftp._list = util.promisify(this._ftp.list);
    this._ftp._get = util.promisify(this._ftp.get);
    this._ftp._put = util.promisify(this._ftp.put);
    this._ftp._append = util.promisify(this._ftp.append);

    this._dirname = '';  // last local dir
    this._curdir = '';   // last ftp dir
  }

  /**
   *
   */
  async activate() {
    if (this._isActive)
      return this._ftp;

    this._isActive = true;
    let options = this.options.ftp || {};

    await this.connect(options);

    return this._ftp;
  }

  /**
   *
   */
  async relax() {
    this._isActive = false;
    if (this._ftp) this._ftp.end();
    this._ftp = null;
  }

  connect(options) {
    return new Promise((resolve, reject) => {

      this._ftp.on('ready', () => {
        resolve(true);
      });

      this._ftp.on('error', (err) => {
        reject(err);
      });

      // connect to host
      this._ftp.connect({
        host: this._url.host || "127.0.0.1",
        port: this._url.port || 21,
        user: this._url.username || (this.smt.credentials && this.smt.credentials.user) || 'anonymous',
        password: this._url.password || (this.smt.credentials && this.smt.credentials.password) || 'anonymous@dictadata',
        secure: Object.prototype.hasOwnProperty.call(options, "secure") ? options.secure : false
      });

    });
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
        await ftp._cwd(dirpath + relpath);
        let dirList = await ftp._list();
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
    logger.debug("FtpFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = schema;
      var ftp = await this.activate();

      // create the read stream
      await ftp._cwd(this._url.pathname);

      rs = await ftp._get(filename);

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
    logger.debug("FtpFileSystem createWriteStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let ws = false;

    try {
      let filename = schema;
      var ftp = await this.activate();

      // create the read stream
      await this._walkCWD(this._url.pathname);

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and ftp reads from passthrough

      if (options.append) {
        this._isNewFile = false;  // should check for existence
        ws.fs_ws_promise = ftp._append(ws, filename);
      }
      else {
        this._isNewFile = true;
        ws.fs_ws_promise = ftp._put(ws, filename);
      }
      // ws.fs_ws_promise is an added property. Used so that StorageWriters 
      // using filesystems know when a transfer is complete.

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
      let wdPath = this._url.pathname + (options.recursive ? path.dirname(options.rpath) : '');
      let src = wdPath + (options.recursive ? options.rpath : options.name);
      let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));
      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      // create the read stream
      var ftp = await this.activate();
      await ftp._cwd(wdPath);
      let rs = await ftp._get(options.name);

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
      let dest = this._url.pathname + (options.useRPath ? options.rpath : options.name);
      logger.verbose("  " + src + " >> " + dest);

      // upload file
      var ftp = await this.activate();
      let wdPath = path.dirname(dest);
      await this._walkCWD(wdPath);
      await ftp._put(src, options.name);
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
        throw new Error("Could not walk ftp directory.");
    }
  }

  async _cwd(path) {
    try {
      await this._ftp._cwd(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

  async _mkdir(path) {
    try {
      await this._ftp._mkdir(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

};
