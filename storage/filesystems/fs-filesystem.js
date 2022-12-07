/**
 * storage/filesystems/fs-filesystem
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

module.exports = exports = class FSFileSystem extends StorageFileSystem {

  /**
   * construct a FSFileSystem object
   * @param {*} smt storage memory trace
   * @param {*} options filesystem options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("FSFileSystem");

    this._dirname = ''; // last dirname
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
    logger.debug('fs-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      var list = [];

      let dirpath = url.fileURLToPath(this.url);

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scanner function
      async function readFolder(dirpath, relpath, options) {

        let dirname = path.join(dirpath, relpath);
        logger.debug("opendir ", dirname);
        // process files in current folder
        let dir = await fsp.opendir(dirname);
        for await (let dirent of dir) {
          if (dirent.isFile() && rx.test(dirent.name)) {
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

        // process subfolders
        if (options.recursive) {
          dir = await fsp.opendir(dirname);
          for await (let dirent of dir) {
            logger.debug(dirent.name);
            if (dirent.isDirectory()) {
              let subpath = relpath + dirent.name + "/";
              await readFolder(dirpath, subpath, options);
            }
          }
        }

        //await dir.close();
      }

      // start scanning directory
      await readFolder(dirpath, "", options);

      return new StorageResults(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Remove schema, i.e. delete file(s), on the local filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns StorageResults object with resultCode.
   */
  async dull(options) {
    logger.debug('fs-filesystem dull');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;

      let filepath = path.join(url.fileURLToPath(this.url), schema);
      await fsp.unlink(filepath);

      return new StorageResults(0);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Create an object mode readstream from the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns a node.js readstream based object if successful.
  */
  async createReadStream(options) {
    logger.debug("FSFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let rs = null;

      let filename = path.join(url.fileURLToPath(this.url), schema);
      rs = fs.createReadStream(filename);

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
   * @param {*} options.schema Override smt.schema with filename at the same locus.
   * @param {*} options.append Flag used indicate overwrite or append destination file. Default is overwrite.
   * @returns a node.js writestream based object if successful.
  */
  async createWriteStream(options) {
    logger.debug("FSFileSystem createWriteStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let ws = false;

      let filename = path.join(url.fileURLToPath(this.url), schema);
      let append = this.options.append || false;

      let dirname = path.dirname(filename);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }

      this.isNewFile = !(append && fs.existsSync(filename));

      let flags = append ? 'a' : 'w';
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
   * @param {boolean} options.use_rpath If true replicate folder structure of remote filesystem in local filesystem.
   * @returns StorageResults object with resultCode;
   */
  async getFile(options) {
    logger.debug("fs-fileSystem getFile");

    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

      let src = path.join(url.fileURLToPath(this.url), options.entry.rpath);

      let smt = new SMT(options.smt); // smt.locus is destination folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substr(5) : smt.locus;
      let dest = path.join(folder, (options.use_rpath ? options.entry.rpath : options.entry.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);
      await fsp.copyFile(src, dest);

      return new StorageResults(resultCode);
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
   * @returns StorageResults object with resultCode.
   */
  async putFile(options) {
    logger.debug("fs-fileSystem putFile");

    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

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

      return new StorageResults(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

};
