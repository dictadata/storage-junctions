// filesystems/fs-filesystem
"use strict";

const StorageFileSystem = require("./storage-filesystem");
const { StorageResponse, StorageError } = require("../types");
const { logger } = require("../utils");

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

module.exports = exports = class FSFileSystem extends StorageFileSystem {

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
    logger.debug('fs-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      var list = [];

      let dirpath = url.fileURLToPath(this._url);

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scanner function
      async function scanner(dirpath, relpath, options) {

        let dirname = path.join(dirpath, relpath);
        let dir = await fsp.opendir(dirname);
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

      return new StorageResponse(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async dull(options) {
    logger.debug('fs-filesystem dull');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;

      let filepath = path.join(url.fileURLToPath(this._url), schema);
      await fsp.unlink(filepath);

      return new StorageResponse(0);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("FSFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let rs = null;

      let filename = path.join(url.fileURLToPath(this._url), schema);
      rs = fs.createReadStream(filename);

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
        rs.pipe(gzip);
        return gzip;
      }

      return rs;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
  * createWriteStream
  */
  async createWriteStream(options) {
    logger.debug("FSFileSystem createWriteStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let ws = false;

      let filename = path.join(url.fileURLToPath(this._url), schema);
      let append = this.options.append || false;

      let dirname = path.dirname(filename);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }

      this._isNewFile = !(append && fs.existsSync(filename));

      let flags = append ? 'a' : 'w';
      ws = fs.createWriteStream(filename, { flags: flags });

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
        gzip.pipe(ws);
        return gzip;
      }

      return ws;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async download(options) {
    logger.debug("fs-fileSystem download");

    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

      let src = path.join(url.fileURLToPath(this._url), options.name);
      let dest = path.join(options.downloads, (options.keep_rpath ? options.rpath : options.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);
      await fsp.copyFile(src, dest);

      return new StorageResponse(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async upload(options) {
    logger.debug("fs-fileSystem upload");

    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

      let src = path.join(options.uploadPath, options.rpath);
      let dest = path.join(url.fileURLToPath(this._url), (options.keep_rpath ? options.rpath : options.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);
      await fsp.copyFile(src, dest);

      return new StorageResponse(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};
