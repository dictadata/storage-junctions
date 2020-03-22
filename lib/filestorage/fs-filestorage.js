"use strict";

const FileStorage = require("./index");
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const { StorageError } = require("../types");
const util = require('util');

const opendir = util.promisify(fs.opendir);

module.exports = exports = class fsFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);

    this._logger.debug("fsFileStorage");
  }

  async scan() {
    var list = [];

    try {
      let dirpath = this._smt.locus;
      let subpath = this._options.subpath || '';

      let filespec = this._options.filespec || this._smt.schema;
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scan function
      async function scanner(dirpath, subpath, options) {

        let dir = await opendir(dirpath + subpath);
        //console.log("opendir ", dirpath + subpath);

        for await (let dirent of dir) {
          //console.log(dirent.name);
          if (dirent.isDirectory() && options.recursive) {
            let sp = subpath + dirent.name + "/"; //path.join(dirpath, dirent.name);
            await scanner(dirpath, sp, options);
          }
          else if (dirent.isFile() && dirent.name.match(rx)) {
            let relpath = subpath + dirent.name; //path.join(dirpath, dirent.name);
            if (options.forEach)
              await options.forEach(relpath);
            else
              list.push(relpath);
          }
        }
        //await dir.close();
      }

      await scanner(dirpath, subpath, this._options);
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
    this._logger.debug("fsFileStorage createReadStream");
    let rs = null;

    try {
      let filename = path.join(this._smt.locus, this._smt.schema) || '';
      rs = fs.createReadStream(filename);

      ///// check for zip
      if (filename.endsWith('.gz')) {
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
    this._logger.debug("fsFileStorage createWriteStream")
    let ws = false;

    try {
      let filename = path.join(this._smt.locus, this._smt.schema) || '';
      let append = this._options.append || false;

      this.isNewFile = !(append && fs.existsSync(filename));

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
      this._logger.error(err.message);
      throw err;
    }

    return ws;
  }

};
