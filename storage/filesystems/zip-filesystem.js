/**
 * storage/filesystems/zip-filesystem
 */
"use strict";

const StorageFileSystem = require("./storage-filesystem");
const { SMT, StorageResults, StorageError } = require("../types");
const { logger } = require("../utils");

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

const StreamZip = require('node-stream-zip');

module.exports = exports = class ZipFileSystem extends StorageFileSystem {

  /**
   * construct a ZipFileSystem object
   * @param {*} smt storage memory trace
   * @param {*} options filesystem options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("ZipFileSystem");

    let pathname = decodeURI(this.url.pathname);

    let z = pathname.indexOf(".zip");
    if (z < pathname.length - 4) {
      this.zipname = pathname.substring(0, z + 4);
      this.prefix = pathname.substring(z + 5); // skip the '/'
    }
    else {
      this.zipname = pathname;
      this.prefix = "";
    }

  }

  /**
   * Open the .zip file.
   */
  async activate() {
    this.isActive = true;
    this.zip = new StreamZip.async({ file: this.zipname });
  }

  /**
   * Close the .zip file
   */
  async relax() {
    this.isActive = false;
    if (this.zip)
      this.zip.close();
  }

  /**
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @returns StorageResults object where data is an array of directory entry objects.
   */
  async list(options) {
    logger.debug('zip-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      var list = [];

      let filespec = this.prefix + schema || '*';
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

      return new StorageResults(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async findEntry(filename) {
    const entries = await this.zip.entries();

    for (const [ name, entry ] of Object.entries(entries)) {
      if (entry.isFile && (0 === filename.localeCompare(name, undefined, { sensitivity: 'base' }))) {
        return entry;
      }
    }

    return null;
  }

  /**
   * Remove schema, i.e. file(s), on the filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema with a filename in the same locus.
   * @returns StorageResults object with status.
   */
  async dull(options) {
    logger.debug('zip-filesystem dull');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    throw new StorageError(501);

    //return new StorageResults(0);
  }

  /**
   * Create an object mode readstream from the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema with a filename in the same locus.
   * @returns a node.js readstream based object if successful.
  */
  async createReadStream(options) {
    logger.debug("ZipFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let rs = null;

      let filename = this.prefix + schema;
      let entry = await this.findEntry(filename);
      if (!entry)
        throw new StorageError(404);

      rs = await this.zip.stream(entry);

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var decoder = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
        rs.pipe(decoder);
        return decoder;
      }

      return rs;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Create an object mode writestream to the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema with filename at the same locus.
   * @param {boolean} options.append Flag used indicate overwrite or append destination file. Default is overwrite.
   * @returns a node.js writestream based object if successful.
  */
  async createWriteStream(options) {
    logger.debug("ZipFileSystem createWriteStream");

    throw new StorageError(501);

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let ws = false;

      let filename = path.join(url.fileURLToPath(this.url), schema);
      let append = this.options.append || false;

      ws = fs.createWriteStream(filename, { flags: flags });

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var decoder = zlib.createGzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
        decoder.pipe(ws);
        return decoder;
      }

      return ws;
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Download a file from remote filesystem to local filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {SMT} options.smt smt.locus specifies the output folder in the local filesystem.
   * @param {boolean} options.use_rpath If true replicate folder structure of zip filesystem in local filesystem.
   * @returns StorageResults object with status;
   */
  async getFile(options) {
    logger.debug("zip-fileSystem getFile");

    try {
      options = Object.assign({}, this.options, options);
      let status = 0;

      let src = options.entry.rpath || options.entry.name;

      let smt = new SMT(options.smt); // smt.locus is destination folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substr(5) : smt.locus;
      let dest = path.join(folder, (options.use_rpath ? options.entry.rpath : options.entry.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);
      await this.zip.extract(src, dest);

      return new StorageResults(status);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Upload a local file to the remote filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {SMT} options.smt smt.locus specifies the source folder in the local filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {boolean} options.use_rpath If true replicate folder structure of local filesystem in remote filesystem.
   * @returns StorageResults object with status.
   */
  async putFile(options) {
    logger.debug("zip-fileSystem putFile");

    throw new StorageError(501);

    try {
      options = Object.assign({}, this.options, options);
      let status = 0;

      let smt = new SMT(options.smt); // smt.locus is source folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substr(5) : smt.locus;
      let src = path.join(folder, options.entry.rpath);

      let dest = path.join(url.fileURLToPath(this.url), (options.use_rpath ? options.entry.rpath : options.entry.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);
      await fsp.copyFile(src, dest);

      return new StorageResults(status);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};
