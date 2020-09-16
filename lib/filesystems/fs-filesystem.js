"use strict";

const FileSystem = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const fs = require('fs');
const path = require('path');
const util = require('util');
const zlib = require('zlib');

const opendir = util.promisify(fs.opendir);


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
    var list = [];

    try {
      let dirpath = this.smt.locus;

      let filespec = options.schema || this.smt.schema || '*';
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
            let filepath = relpath + dirent.name;
            if (options.forEach)
              await options.forEach(filepath);
            
            list.push(filepath);
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
  async createReadStream() {
    logger.debug("fsFileSystem createReadStream");
    let options = this.options || {};
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
      logger.error(err);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    logger.debug("fsFileSystem createWriteStream");
    let options = this.options || {};
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
      logger.error(err);
      throw err;
    }

    return ws;
  }

};
