/**
 * storage/filesystems/ftp-filesystem
 */
"use strict";

const StorageFileSystem = require('./storage-filesystem');
const { SMT, StorageResults, StorageError } = require('../types');
const { exists, logger } = require('@dictadata/lib');
const auth = require('../authentication');

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const stream = require('node:stream');
const zlib = require('node:zlib');
const ftp = require('basic-ftp');

module.exports = exports = class FTPFileSystem extends StorageFileSystem {

  /**
   * construct a StorageFileSystem object
   * @param {String|SMT} SMT  example "model|ftp://username:password@host/directory/|filespec|*"
   * @param {Object}  options  filesystem options
   * @param {Object}  options.ftp ftp options
   * @param {Boolean} options.ftp.secure use secure connection
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("FTPFileSystem");

    this._client = new ftp.Client();
    //this._client.ftp.verbose = true;

    this._dirname = '';  // last local dir
    this._curdir = '';   // last ftp dir

    // outstanding stream task
    this._ftpTask;
  }

  /**
   * Connect to FTP server.
   */
  async activate() {
    logger.debug("FTPFileSystem ACTIVATE");
    const ftpOptions = this.options.ftp || {};

    let cred = auth.recall(this.url) || {};

    // connect to host
    let result = await this._client.access({
      host: this.url.host || "127.0.0.1",
      port: this.url.port || 21,
      user: this.url.username || cred.auth?.username || 'anonymous',
      password: this.url.password || cred.auth?.password || 'anonymous@dictadata',
      secure: Object.hasOwn(ftpOptions, "secure") ? ftpOptions.secure : false
    });
    logger.debug("ftp " + JSON.stringify(result));

    this._client.trackProgress(info => {
      logger.verbose(JSON.stringify({
        "File": info.name,
        "Type": info.type,
        "Transferred": info.bytes,
        "Transferred Overall": info.bytesOverall
      }));
    })

    this.isActive = true;
    logger.debug("FTPFileSystem ACTIVATED");
  }

  /**
   * End FTP session and disconnect from server.
   */
  async relax() {
    logger.debug("FTPFileSystem RELAX");
    if (this._ftpTask) {
      let result = await this._ftpTask;
      logger.debug("ftp stream result: " + JSON.stringify(result));
    }

    if (this.isActive) {
      this.isActive = false;
      if (!this._client.closed)
        this._client.close();
    }
  }

/*
  filepath(filename = "") {
    return path.join(decodeURI(this.url.pathname), decodeURI(filename));
  }
*/

  /**
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @returns StorageResults object where data is an array of directory entry objects.
   */
  async list(options) {
    logger.debug('ftp-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options?.schema || this.smt.schema;
      let list = [];

      let wdPath = decodeURI(this.url.pathname);

      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace(/\./g, '\\.');
      rx = rx.replace(/\?/g, '.');
      rx = rx.replace(/\*/g, '.*');
      rx = new RegExp(rx);

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      let client = this._client;
      let readFolder = async (dirpath, relpath, options) => {
        logger.debug('readFolder');

        // get list
        await client.cd(dirpath + relpath);
        let dirList = await client.list();

        // process files in current folder
        for (let entry of dirList) {
          if (entry.type === 1 && rx.test(entry.name)) {
            entry.rpath = relpath + entry.name;

            if (options.forEach)
              await options.forEach(entry);
            list.push(entry);
          }
        }

        // process sub-folders
        if (options.recursive) {
          for (let entry of dirList) {
            if (entry.type === 2) {
              let subpath = relpath + entry.name + '/';
              await readFolder(dirpath, subpath, options);
            }
          }
        }

      };

      // start scanning FTP directory
      await readFolder(wdPath, "", options);

      return new StorageResults(0, null, list);
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

  /**
   * Remove schema, i.e. file(s), on the filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns StorageResults object with status.
   */
  async dull(options) {
    logger.debug('ftp-filesystem dull');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options?.schema || this.smt.schema;
      let filename = schema;

      await this._client.cd(decodeURI(this.url.pathname));
      await this._client.remove(filename);

      return new StorageResults(0);
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
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
      if (this._ftpTask) {
        let result = await this._ftpTask;
        logger.debug("ftp stream result: " + JSON.stringify(result));
        this._ftpTask = null;
      }

      options = Object.assign({}, this.options, options);
      let schema = options?.schema || this.smt.schema;
      let filename = schema;

      // ftp writes to passthrough and app reads from passthrough
      let spt = new stream.PassThrough();
      /*
      let spt = new stream.Transform({
        autoDestroy: false,
        transform(data, encoding, callback) {
          this.push(data);
          callback();
        },
        flush(callback) {
          callback();
        }
      })
      */

      // create the read stream
      let result = await this._client.cd(decodeURI(this.url.pathname));
      logger.debug("ftp " + JSON.stringify(result));

      this._ftpTask = this._client.downloadTo(spt, filename)

      let rs = spt;
      ///// check for zip
      if (filename.endsWith('.gz')) {
        rs = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
        spt.pipe(rs);
      }
      return rs;
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
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
      if (this._ftpTask) {
        let result = await this._ftpTask;
        logger.debug("ftp stream result: " + JSON.stringify(result));
        this._ftpTask = null;
      }

      options = Object.assign({}, this.options, options);
      let schema = options?.schema || this.smt.schema;

      // create the read stream
      await this._client.ensureDir(decodeURI(this.url.pathname));

      // app writes to passthrough and ftp reads from passthrough
      let ws = new stream.PassThrough();

      let filename = schema;
      if (options.append) {
        this.isNewFile = false;  // should check for existence
        this._ftpTask = this._client.appendFrom(ws, filename);
      }
      else {
        this.isNewFile = true;
        this._ftpTask = this._client.uploadFrom(ws, filename);
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
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

  /**
   * Download a file from remote filesystem to local filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {SMT} options.smt smt.locus specifies the output folder in the local filesystem.
   * @param {boolean} options.use_rpath If true replicate folder structure of remote filesystem in local filesystem.
   * @returns StorageResults object with status;
   */
  async getFile(options) {
    logger.debug("ftp-fileSystem getFile");

    try {
      options = Object.assign({}, this.options, options);
      let status = 0;

      let wdPath = decodeURI(this.url.pathname + (options.recursive ? path.dirname(options.entry.rpath) : ''));
      let src = wdPath + (options.recursive ? options.entry.rpath : options.entry.name);

      let smt = new SMT(options.smt); // smt.locus is destination folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substring(5) : smt.locus;
      let dest = path.join(folder, (options.use_rpath ? options.entry.rpath : options.entry.name));

      let dirname = path.dirname(dest);
      let stat = await exists(dirname)
      if (dirname !== this._dirname && !stat) {
        await fsp.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      // create the read stream
      await this._client.cd(wdPath);
      await this._client.downloadTo(dest, options.entry.name);

      return new StorageResults(status);
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
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
    logger.debug("ftp-fileSystem putFile");

    try {
      options = Object.assign({}, this.options, options);
      let status = 0;

      let smt = new SMT(options.smt); // smt.locus is source folder
      let folder = smt.locus.startsWith("file:") ? smt.locus.substring(5) : smt.locus;
      let src = path.join(folder, options.entry.rpath);

      let dest = decodeURI(this.url.pathname + (options.use_rpath ? options.entry.rpath : options.entry.name).split(path.sep).join(path.posix.sep));
      logger.verbose("  " + src + " >> " + dest);

      // upload file
      let wdPath = path.dirname(dest);
      await this._client.ensureDir(wdPath);
      await this._client.uploadFrom(src, options.entry.name);

      return new StorageResults(status);
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

/* not needed for basic-ftp

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
      await this._client.cd(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }

  async _mkdir(path) {
    try {
      await this._client.ensureDir(path);
      return 0;
    }
    catch (err) {
      return err.code;
    }
  }
*/

  /**
   * Convert a FTP error into a StorageResponse
   *
   * @param {*} err a FTP error object
   * @returns a new StorageError object
   */
StorageError(err) {
    if (err instanceof StorageError)
      return err;

    let status = 500;
    let message = ('message' in err) ? err.message : "error";

    // FTP response code
    switch (err.code) {
      case 0:
        status = 200;
        break;
      default:
        status = 500;
    }

    return new StorageError(status, message, { cause: err });
  }

};
