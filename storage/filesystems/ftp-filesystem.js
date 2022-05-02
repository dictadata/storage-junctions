/**
 * dictadata/storage/filesystems/ftp-filesystem
 */
"use strict";

const StorageFileSystem = require("./storage-filesystem");
const { SMT, StorageResponse, StorageError } = require("../types");
const { hasOwnProperty, logger } = require("../utils");

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const zlib = require('zlib');

const FTP = require("promise-ftp");
const { PassThrough } = require('stream');
const { finished } = require('stream/promises');


module.exports = exports = class FTPFileSystem extends StorageFileSystem {

  /**
   * construct a StorageFileSystem object
   * @param {*} SMT  example "model|ftp://username:password@host/directory/|filespec|*"
   * @param {*} options  filesystem options
   * @param {*} options.ftp ftp options
   * @param {boolean} options.ftp.secure use secure connection
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("FTPFileSystem");

    this._ftp = new FTP();

    this._dirname = '';  // last local dir
    this._curdir = '';   // last ftp dir
  }

  /**
   * Connect to FTP server.
   */
  async activate() {
    //console.log("activate");
    const ftpOptions = this.options.ftp || {};

    // connect to host
    await this._ftp.connect({
      host: this.url.host || "127.0.0.1",
      port: this.url.port || 21,
      user: this.url.username || (this.smt.credentials && this.smt.credentials.user) || 'anonymous',
      password: this.url.password || (this.smt.credentials && this.smt.credentials.password) || 'anonymous@dictadata',
      secure: hasOwnProperty(ftpOptions, "secure") ? ftpOptions.secure : false
    });

    this.isActive = true;
    //console.log("activated");
  }

  /**
   * End FTP session and disconnect from server.
   */
  async relax() {
    if (this.isActive) {
      this.isActive = false;
      await this._ftp.end();
    }
  }

  /**
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @returns StorageResponse object where data is an array of directory entry objects.
   */
  async list(options) {
    logger.debug('ftp-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let list = [];

      let wdPath = decodeURI(this.url.pathname);

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      let ftp = this._ftp;
      let readFolder = async (dirpath, relpath, options) => {
        logger.debug('readFolder');

        // get list
        await ftp.cwd(dirpath + relpath);
        let dirList = await ftp.list();

        // process files in current folder
        for (let entry of dirList) {
          if (entry.type === '-' && rx.test(entry.name)) {
            entry.rpath = relpath + entry.name;
            if (options.forEach)
              await options.forEach(entry);

            list.push(entry);
          }
        }

        // process sub-folders
        if (options.recursive) {
          for (let entry of dirList) {
            if (entry.type === 'd') {
              let subpath = relpath + entry.name + '/';
              await readFolder(dirpath, subpath, options);
            }
          }
        }

      };

      // start scanning FTP directory
      await readFolder(wdPath, "", options);

      return new StorageResponse(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(err.code, err.message).inner(err);
    }
  }

  /**
   * Remove schema, i.e. file(s), on the filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns StorageResponse object with resultCode.
   */
  async dull(options) {
    logger.debug('ftp-filesystem dull');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let filename = schema;

      await this._ftp.cwd(decodeURI(this.url.pathname));
      await this._ftp.delete(filename);

      return new StorageResponse(0);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(err.code, err.message).inner(err);
    }
  }

  /**
   * Create an object mode readstream from the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns a node.js readstream based object if successful.
  */
  async createReadStream(options) {
    logger.debug("FTPFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let rs = null;

      let filename = schema;

      // create the read stream
      await this._ftp.cwd(decodeURI(this.url.pathname));

      rs = await this._ftp.get(filename);

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
      throw new StorageError(err.code, err.message).inner(err);
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
    logger.debug("FTPFileSystem createWriteStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let ws = false;

      let filename = schema;

      // create the read stream
      await this._walkCWD(decodeURI(this.url.pathname));

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and ftp reads from passthrough

      if (options.append) {
        this.isNewFile = false;  // should check for existence
        ws.fs_ws_promise = this._ftp.append(ws, filename);
      }
      else {
        this.isNewFile = true;
        ws.fs_ws_promise = this._ftp.put(ws, filename);
      }
      // ws.fs_ws_promise is an added property. Used so that StorageWriters
      // using filesystems know when a transfer is complete.

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
      throw new StorageError(err.code, err.message).inner(err);
    }
  }

  /**
   * Download a file from remote filesystem to local filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {SMT} options.smt smt.locus specifies the output folder in the local filesystem.
   * @param {boolean} options.use_rpath If true replicate folder structure of remote filesystem in local filesystem.
   * @returns StorageResponse object with resultCode;
   */
  async getFile(options) {
    logger.debug("ftp-fileSystem getFile");

    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

      let wdPath = decodeURI(this.url.pathname + (options.recursive ? path.dirname(options.entry.rpath) : ''));
      let src = wdPath + (options.recursive ? options.entry.rpath : options.entry.name);

      let smt = new SMT(options.smt); // smt.locus is destination folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substr(5) : smt.locus;
      let dest = path.join(folder, (options.use_rpath ? options.entry.rpath : options.entry.name));

      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      // create the read stream
      await this._ftp.cwd(wdPath);
      let rs = await this._ftp.get(options.entry.name);

      // save to local file
      let ws = fs.createWriteStream(dest);

      rs.pipe(ws);
      await finished(rs);
      await finished(ws);

      return new StorageResponse(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(err.code, err.message).inner(err);
    }
  }

  /**
   * Upload a local file to the remote filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {SMT} options.smt smt.locus specifies the source folder in the local filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {boolean} options.use_rpath If true replicate folder structure of local filesystem in remote filesystem.
   * @returns StorageResponse object with resultCode.
   */
  async putFile(options) {
    logger.debug("ftp-fileSystem putFile");

    try {
      options = Object.assign({}, this.options, options);
      let resultCode = 0;

      let smt = new SMT(options.smt); // smt.locus is source folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substr(5) : smt.locus;
      let src = path.join(folder, options.entry.rpath);

      let dest = decodeURI(this.url.pathname + (options.use_rpath ? options.entry.rpath : options.entry.name).split(path.sep).join(path.posix.sep));
      logger.verbose("  " + src + " >> " + dest);

      // upload file
      let wdPath = path.dirname(dest);
      await this._walkCWD(wdPath);
      await this._ftp.put(src, options.entry.name);

      return new StorageResponse(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(err.code, err.message).inner(err);
    }
  }


  async _walkCWD(path) {
    if (path === this._curdir)
      return;
    else
      this._curdir = path;

    let elements = path.split('/');
    let rc = 0;

    rc = await this._cwd('/');
    for (let dir of elements) {
      rc = await this._cwd(dir);
      if (rc !== 0) {
        rc = await this._mkdir(dir);
        if (rc === 0)
          rc = await this._cwd(dir);
      }

      if (rc !== 0)
        throw new StorageError(rc, "Could not walk ftp directory");
    }
  }

  async _cwd(path) {
    try {
      await this._ftp.cwd(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

  async _mkdir(path) {
    try {
      await this._ftp.mkdir(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

};
