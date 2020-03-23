"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");

const ftp = require("ftp-ts");
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
    this.ftp = new ftp();

    this.logger.debug("ftpFileStorage");
  }

  async activate() {

    // connect to host
    await this.ftp.connect({
      host: this.options.host || "127.0.0.1",
      port: this.options.port || 21,
      user: this.options.user || (this.smt.credentials && this.smt.credentials.user) || 'anonymous',
      password: this.options.user || (this.smt.credentials && this.smt.credentials.password) || 'anonymous@dictadata',
      secure: Object.prototype.hasOwnProperty.call(this.options, "secure") ? this.options.secure : true
    });

    this.isActive = true;
  }

  async relax() {
    this.isActive = false;
    this.ftp.end();
  }

  async scan(options) {
    options = Object.assign({}, this.options.scan, options);
    let list = [];

    try {
      let wdPath = this.smt.locus.substring(4);  // remove "ftp:"

      let filespec = this.options.filespec || this.smt.schema;
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scan function
      // eslint-disable-next-line no-inner-declarations
      async function scanner(dirpath, options) {

        // get list
        await this.ftp.cwd(dirpath);
        let dirList = await this.ftp.list();
        for (let entry of dirList) {
          if (entry.type === 'd' && options.recursive) {
            let path = dirpath + entry.name;
            await scanner(path, options);
          }
          else if (entry.type === '-' && entry.match(rx)) {
            let relpath = wdPath + entry.name;
            if (options.forEach)
              await options.forEach(relpath);
            else
              list.push(relpath);
          }
        }
      }

      await scanner(wdPath, this.options);
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }

    return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    this.logger.debug("ftpFileStorage createReadStream");
    let rs = null;

    try {
      let filename = this.smt.schema;

      // create the read stream
      let wdPath = this.smt.locus.substring(4);  // remove "ftp:"
      await this.ftp.cwd(wdPath);

      let rs = await this.ftp.get(filename);

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGunzip();
        rs.pipe(gzip);
        return gzip;
      }
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    this.logger.debug("ftpFileStorage createWriteStream")
    let ws = false;

    try {
      let filename = this.smt.schema;

      // create the read stream
      let wdPath = this.smt.locus.substring(4);  // remove "ftp:"
      await this.ftp.cwd(wdPath);

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and ftp reads from passthrough

      if (this.options.append) {
        this.ftp.append(ws, filename);
        this.isNewFile = false;  // should check for existence
      }
      else {
        this.ftp.put(ws, filename);
        this.isNewFile = true;
      }

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }

    return ws;
  }

};
