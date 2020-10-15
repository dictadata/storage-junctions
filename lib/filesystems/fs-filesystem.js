"use strict";

const FileSystem = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const fs = require('fs');
const path = require('path');
const util = require('util');
const zlib = require('zlib');

const opendir = util.promisify(fs.opendir);
const copyFile = util.promisify(fs.copyFile);

module.exports = exports = class fsFileSystem extends FileSystem {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("fsFileSystem");
  }

  async list(options) {
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    var list = [];

    try {
      let dirpath = this.smt.locus.substring(this._fstlen);

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scanner function
      async function scanner(dirpath, relpath, options) {

        let dir = await opendir(dirpath + relpath);
        logger.debug("opendir ", dirpath + relpath);

        for await (let dirent of dir) {
          //console.log(dirent.name);
          if (dirent.isDirectory() && options.recursive) {
            let subpath = relpath + dirent.name + "/";
            await scanner(dirpath, subpath, options);
          }
          else if (dirent.isFile() && rx.test(dirent.name)) {
            let info = fs.statSync(dirpath + relpath + dirent.name);
            let entry = {
              name: dirent.name,
              rpath: relpath + dirent.name,
              size: info.size,
              date: info.mtime
            }

            if (options.forEach)
              await options.forEach(entry);
            list.push(entry);
          }
        }
        //await dir.close();
      }

      await scanner(dirpath, "", options);
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
    logger.debug("fsFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = path.join(this.smt.locus.substring(this._fstlen), schema) || '';
      rs = fs.createReadStream(filename);

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
    logger.debug("fsFileSystem createWriteStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let ws = false;

    try {
      let filename = path.join(this.smt.locus.substring(this._fstlen), schema) || '';
      let append = this.options.append || false;

      this._isNewFile = !(append && fs.existsSync(filename));

      let flags = append ? 'a' : 'w';
      ws = fs.createWriteStream(filename, { flags: flags });

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
    logger.debug("FileSystem download");

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let result = true;

    let src = this.smt.locus.substring(this._fstlen) + options.name;
    let dest = options.folder + (options.useRPath ? options.rpath : options.name);

    await copyFile(src, dest);

    return result;
  }

  async upload(options) {
    logger.debug("FileSystem upload");

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let result = true;

    let src = options.rpath;
    let dest = this.smt.locus.substring(this._fstlen)
      + (options.useRPath ? options.rpath : options.name);

    await copyFile(src, dest);

    return result;
  }

};
