"use strict";

const FileSystem = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');
const zlib = require('zlib');

const opendir = util.promisify(fs.opendir);
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

module.exports = exports = class FSFileSystem extends FileSystem {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("FSFileSystem");

    this._dirname = ''; // last dirname
  }

  async list(options) {
    logger.verbose('fs-filesystem list');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    var list = [];

    try {
      let dirpath = url.fileURLToPath(this._url);

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scanner function
      async function scanner(dirpath, relpath, options) {

        let dirname = path.join(dirpath, relpath);
        let dir = await opendir(dirname);
        logger.debug("opendir ", dirname);

        for await (let dirent of dir) {
          logger.debug(dirent.name);
          if (dirent.isDirectory() && options.recursive) {
            let subpath = relpath + dirent.name + "/";
            await scanner(dirpath, subpath, options);
          }
          else if (dirent.isFile() && rx.test(dirent.name)) {
            let info = fs.statSync(path.join(dirpath, relpath, dirent.name));
            let entry = {
              name: dirent.name,
              rpath: path.join(relpath, dirent.name),
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
    logger.debug("FSFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = path.join(url.fileURLToPath(this._url), schema);
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
    logger.debug("FSFileSystem createWriteStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let ws = false;

    try {
      let filename = path.join(url.fileURLToPath(this._url), schema);
      let append = this.options.append || false;

      let dirname = path.dirname(filename);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }

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
    logger.debug("fs-fileSystem download");

    options = Object.assign({}, this.options, options);
    let result = true;

    let src = path.join(url.fileURLToPath(this._url), options.name);
    let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));

    let dirname = path.dirname(dest);
    if (dirname !== this._dirname && !fs.existsSync(dirname)) {
      await mkdir(dirname, { recursive: true });
      this._dirname = dirname;
    }
    logger.verbose("  " + src + " >> " + dest);
    await copyFile(src, dest);

    return result;
  }

  async upload(options) {
    logger.debug("fs-fileSystem upload");

    options = Object.assign({}, this.options, options);
    let result = true;

    let src = path.join(options.uploadPath, options.rpath);
    let dest = path.join(url.fileURLToPath(this._url), (options.useRPath ? options.rpath : options.name));

    let dirname = path.dirname(dest);
    if (dirname !== this._dirname && !fs.existsSync(dirname)) {
      await mkdir(dirname, { recursive: true });
      this._dirname = dirname;
    }
    logger.verbose("  " + src + " >> " + dest);
    await copyFile(src, dest);

    return result;
  }

};
