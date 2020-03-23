"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");

const fs = require('fs');
const path = require('path');
const util = require('util');
const zlib = require('zlib');

const opendir = util.promisify(fs.opendir);


module.exports = exports = class fsFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);

    this.logger.debug("fsFileStorage");
  }

  async scan(options) {
    options = Object.assign({}, this.options.scan, options);
    var list = [];

    try {
      let dirpath = this.smt.locus;
      let subpath = options.subpath || '';

      let filespec = options.filespec || this.smt.schema;
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

      await scanner(dirpath, subpath, options);
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
    this.logger.debug("fsFileStorage createReadStream");
    let rs = null;

    try {
      let filename = path.join(this.smt.locus, this.smt.schema) || '';
      rs = fs.createReadStream(filename);

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
    this.logger.debug("fsFileStorage createWriteStream")
    let ws = false;

    try {
      let filename = path.join(this.smt.locus, this.smt.schema) || '';
      let append = this.options.append || false;

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
      this.logger.error(err.message);
      throw err;
    }

    return ws;
  }

};
