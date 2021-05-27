// filesystems/zip-filesystem
"use strict";

const StorageFileSystem = require("./storage-filesystem");
const { StorageResponse, StorageError } = require("../types");
const { logger } = require("../utils");

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

const StreamZip = require('node-stream-zip');

module.exports = exports = class ZipFileSystem extends StorageFileSystem {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("ZipFileSystem");

    this.zipname = this._url.pathname;
  }

    /**
   * Initialize or connect to the file storage system
   */
  async activate() {
    // optional, implement filesystem initialization
    this.isActive = true;
    this.zip = new StreamZip.async({ file: this.zipname });
  }

  /**
   * Diconnect and/or cleanup resources
   */
  async relax() {
    // optional, implement filesystem cleanup
    this.isActive = false;
    if (this.zip)
      this.zip.close();
  }

  async list(options) {
    logger.debug('zip-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      var list = [];

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      const count = await this.zip.entriesCount;
      logger.verbose(`Entries read: ${count}`);

      const entries = await this.zip.entries();
      for (const entry of Object.values(entries)) {
        if (entry.isFile && rx.test(entry.name)) {
          logger.debug(`Entry ${entry.name}: ${entry.size}`);

          entry.rpath = entry.name;
          let p = path.parse(entry.name);
          if (!options.recursive && p.dir)
            continue;
          if (p.dir)
            entry.name = p.base;
          entry.date = new Date(entry.time);

          if (this.options.forEach)
              await this.options.forEach(entry);
          list.push(entry);
        }
      }

      return new StorageResponse(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async dull(options) {
    logger.debug('zip-filesystem dull');

    options = Object.assign({}, this.options, options);
    options.headers = Object.assign({}, this.headers, options.headers);
    let schema = options.schema || this.smt.schema;

    throw new StorageError(501);

    //return new StorageResponse(0);
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("ZipFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let rs = null;

      let filename = schema; // path.join(url.fileURLToPath(this._url), schema);

      rs = await this.zip.stream(filename);

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
    logger.debug("ZipFileSystem createWriteStream");

    throw new StorageError(501);

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let ws = false;

      let filename = path.join(url.fileURLToPath(this._url), schema);
      let append = this.options.append || false;

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

      let src = options.rpath || options.name;
      let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);
      await this.zip.extract(src, dest);
      
      return new StorageResponse(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async upload(options) {
    logger.debug("fs-fileSystem upload");

    throw new StorageError(501);
     
    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

      let src = path.join(options.uploadPath, options.rpath);
      let dest = path.join(url.fileURLToPath(this._url), (options.useRPath ? options.rpath : options.name));

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
