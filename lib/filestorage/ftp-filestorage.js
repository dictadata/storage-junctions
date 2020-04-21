"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const { FTP } = require("ftp-ts");
const { PassThrough } = require('stream');
const zlib = require('zlib');


module.exports = exports = class ftpFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT  example "model|ftp:directory|filename|*"
   * @param {*} options  ftp-ts connection options
   */
  constructor(SMT, options) {
    super(SMT, options);

    this.isActive = false;
    this._ftp = null;

    logger.debug("ftpFileStorage");
  }

  /**
   *
   */
  async activate() {
    if (this.isActive)
      return this._ftp;

    this.isActive = true;
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
      this.isActive = false;
    }

    return this._ftp;
  }

  /**
   *
   */
  async relax() {
    this.isActive = false;
    if (this._ftp) await this._ftp.end();
    this._ftp = null;
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
    options = Object.assign({}, this.options, options);
    let list = [];

    try {
      let wdPath = this.smt.locus.substring(4);  // remove "ftp:"

      let filespec = options.schema || this.smt.schema || '*';
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
            let filepath = relpath + entry.name;
            if (options.forEach)
              await options.forEach(filepath);
            else
              list.push(filepath);
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
  async createReadStream() {
    logger.debug("ftpFileStorage createReadStream");
    let options = this.options || {};
    let rs = null;

    try {
      let filename = this.smt.schema;
      var ftp = await this.activate();

      // create the read stream
      let wdPath = this.smt.locus.substring(4);  // remove "ftp:"
      await ftp.cwd(wdPath);

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
  async createWriteStream() {
    logger.debug("ftpFileStorage createWriteStream");
    let options = this.options || {};
    let ws = false;

    try {
      let filename = this.smt.schema;
      var ftp = await this.activate();

      // create the read stream
      let wdPath = this.smt.locus.substring(4);  // remove "ftp:"
      await ftp.cwd(wdPath);

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and ftp reads from passthrough

      if (options.append) {
        this.isNewFile = false;  // should check for existence
        ws.fs_ws_promise = ftp.append(ws, filename);
      }
      else {
        this.isNewFile = true;
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

};
