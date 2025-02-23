/**
 * storage/filesystems/http-filesystem
 */
"use strict";

const StorageFileSystem = require('./storage-filesystem');
const { SMT, StorageResults, StorageError } = require('../types');
const { exists, httpRequest, htmlParseDir, logger } = require('@dictadata/lib');
const auth = require('../authentication');

const fs = require('node:fs/promises');
const path = require('node:path');
const zlib = require('node:zlib');

const HTMLParser = require('node-html-parser');
const FormData = require('form-data');
const storageError = require('../types/storage-error');
//const { runInThisContext } = require('vm');
//const { URLSearchParams } = require('node:url');

module.exports = exports = class HTTPFileSystem extends StorageFileSystem {

  /**
   * construct a HTTPFileSystem object
   * @param {*} SMT  example "model|url folder|filename|*"
   * @param {*} options  http filesystem options
   * @param {*} options.http set default HTTP options, see httpRequest
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("HTTPFileSystem");

    // set default request headers, options.http.headers will override defaults
    this._headers = Object.assign({
      'accept': "*/*",
      'accept-encoding': "gzip, deflate;q=0.9, br;q=0.1",
      'user-agent': "@dictadata/storage-junctions/http-filesystem (dictadata.net)",
      'cache-control': "max-age=0"
    }, options.http?.headers || {});

    this._dirname = '';
  }

  /**
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @param {string} options.http httpRequest options, see httpRequest
   * @returns StorageResults object where data is an array of directory entry objects.
   */
  async list(options) {
    logger.debug('http-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options?.schema || this.smt.schema;
      let pathname = this.url.pathname || "/";
      let list = [];

      let request = Object.assign({
        method: 'GET',
        base: this.url.origin,
        params: this.options.params
      }, options.http);

      if (!request.auth && auth.has(this.url)) {
        let cred = auth.recall(this.url) || {};
        request.auth = cred.auth?.username + ":" + cred.auth?.password;
      }

      request.headers = Object.assign({},
        this._headers,
        { accept: 'text/html,application/xhtml+xml' },
        options.http?.headers);

      // regex for filespec match
      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace(/\./g, '\\.');
      rx = rx.replace(/\?/g, '.');
      rx = rx.replace(/\*/g, '.*');
      rx = new RegExp(rx);

      let that = this;

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      async function readFolder(dirpath) {
        logger.debug('readFolder');

        // HTTP GET
        let response = await httpRequest(dirpath, request);
        logger.debug(response);
        if (response.statusCode !== 200)
          throw this.StorageError(response);

        let contentType = response?.headers[ 'content-type' ];
        if (!contentType || !contentType.startsWith('text/html')) {
          let sterr = new StorageError(400, 'invalid content-type: ' + contentType);
          logger.warn(sterr);
          throw sterr;
        }

        // parse the html page into a simple DOM
        var root = HTMLParser.parse(response.data, {
          lowerCaseTagName: true,  // convert tag name to lower case (hurt performance heavily)
          script: true,             // retrieve content in <script> (hurt performance slightly)
          style: false,             // retrieve content in <style> (hurt performance slightly)
          pre: true,                // retrieve content in <pre> (hurt performance slightly)
          comment: false            // retrieve comments (hurt performance slightly)
        });

        // parse html directory
        var pre = root.querySelectorAll('pre');
        if (pre.length === 0)
          return;
        var directory = htmlParseDir(response.headers[ "server" ], pre[ 0 ].rawText);
        //logger.debug(JSON.stringify(directory, null, 2));

        // process file entries in current directory
        for (let entry of directory) {
          if (!entry.isDir && rx.test(entry.name)) {
            //logger.debug(JSON.stringify(entry, null, 2));

            // calculate relative path
            entry.rpath = dirpath + entry.name;
            if (entry.rpath.startsWith(that.url.pathname))
              entry.rpath = entry.rpath.substring(that.url.pathname.length);

            if (options.forEach)
              await options.forEach(entry);
            list.push(entry);
          }
        }

        // process subdirectories
        if (options.recursive) {
          for (let entry of directory) {
            if (entry.isDir) {
              let subpath = dirpath + entry.href;
              if (entry.href.startsWith('/'))
                subpath = entry.href;
              await readFolder(subpath);
            }
          }
        }

      }

      // start scanning HTTP directory
      await readFolder(pathname);

      return new StorageResults(0, null, list);
    }
    catch (err) {
      let sterr = new StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

  /**
   * Remove schema, i.e. file(s), on the filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @param {string} options.http httpRequest options, see httpRequest
   * @returns StorageResults object with status.
   */
  async dull(options) {
    logger.debug('http-filesystem dull');

    options = Object.assign({}, this.options, options);
    let schema = options?.schema || this.smt.schema;

    throw new StorageError(501);

    //return new StorageResults(0);
  }

  /**
   * Create an object mode readstream from the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @param {string} options.http httpRequest options, see httpRequest
   * @returns a node.js readstream based object if successful.
  */
  async createReadStream(options) {
    logger.debug("HTTPFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      let schema = Object.hasOwn(options, "schema") ? options.schema : this.smt.schema;
      let filename = schema;

      let request = Object.assign({
        method: 'GET',
        base: this.url.href,
        params: this.options.params,
        responseType: "stream"
      }, options.http);

      if (!request.auth && auth.has(this.url)) {
        let cred = auth.recall(this.url) || {};
        request.auth = cred.auth?.username + ":" + cred.auth?.password;
      }

      request.headers = Object.assign({},
        this._headers,
        options.http?.headers);

      // create read stream
      let rs;
      let redirects = 0;
      while (!rs) {
        try {
          logger.verbose("http  " + filename);
          rs = await httpRequest(filename, request);
        }
        catch (err) {
          if ((err.statusCode === 301 || err.statusCode === 307) && redirects < 10) {
            filename = err.headers.location;
            ++redirects;
          }
          else {
            throw this.StorageError(err);
          }
        }
      }

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var decoder = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
        rs.pipe(decoder);
        return decoder;
      }

      return rs;
    }
    catch (err) {
      let sterr = new StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

  /**
   * Create an object mode writestream to the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with filename at the same locus.
   * @param {*} options.append Flag used indicate overwrite or append destination file. Default is overwrite.
   * @param {string} options.http httpRequest options, see httpRequest
   * @returns a node.js writestream based object if successful.
  */
  async createWriteStream(options) {
    logger.debug("HTTPFileSystem createWriteStream");
    throw new StorageError(501);

    // implement writestream creation in overrides
    //options = Object.assign({}, this.options, options);
    //let schema = options?.schema || this.smt.schema;
    //let ws = false;

    //this.isNewFile = true | false

    //return ws;
  }

  /**
   * Download a file from remote filesystem to local filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {SMT} options.smt smt.locus specifies the output folder in the local filesystem.
   * @param {boolean} options.use_rpath If true replicate folder structure of remote filesystem in local filesystem.
   * @param {string} options.http httpRequest options, see httpRequest
   * @returns StorageResults object with status;
   */
  async getFile(options) {
    logger.debug("HTTPFileSystem getFile");

    try {
      options = Object.assign({}, this.options, options);
      let status = 0;

      let request = Object.assign({
        method: 'GET',
        base: this.url.href,
        params: this.options.params,
        responseType: "stream"
      }, options.http);

      if (!request.auth && auth.has(this.url)) {
        let cred = auth.recall(this.url);
        request.auth = cred.auth?.username + ":" + cred.auth?.password;
      }

      request.headers = Object.assign({},
        this._headers,
        options.http?.headers);

      let src = options.entry.rpath || options.entry.name;

      // smt.locus is destination folder
      let smt = new SMT(options.smt);
      let folder = smt.locus.startsWith("file:") ? smt.locus.substring(5) : smt.locus;
      let filename = options.use_rpath ? options.entry.rpath : (smt.schema !== "*" ? smt.schema : options.entry.name)
      let dest = path.join(folder, filename);

      let dirname = path.dirname(dest);
      let stat = await exists(dirname);
      if (dirname !== this._dirname && !stat) {
        await fs.mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }

      // get file
      let rs;
      let redirects = 0;
      while (!rs) {
        try {
          logger.verbose("http  " + src + " >> " + dest);
          rs = await httpRequest(src, request);
        }
        catch (err) {
          if ((err.statusCode === 301 || err.statusCode === 307) && redirects < 10) {
            src = err.headers.location;
            ++redirects;
          }
          else {
            throw this.StorageError(err);
          }
        }
      }

      // save to local file
      let fd = await fs.open(dest, "w");
      let ws = await fd.createWriteStream();
      await rs.pipe(ws);

      return new StorageResults(status);
    }
    catch (err) {
      let sterr = new StorageError(err);
      throw sterr;
    }
  }

  /**
   * Upload a local file to the remote filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {SMT} options.smt smt.locus specifies the source folder in the local filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {boolean} options.use_rpath If true replicate folder structure of local filesystem in remote filesystem.
   * @param {string} options.http httpRequest options, see httpRequest
   * @param {*} options.formdata HTML formdata that specifies remote filename
   * @returns StorageResults object with status.
   */
  async putFile(options) {
    logger.debug("HTTPFileSystem putFile")

    try {
      options = Object.assign({}, this.options, options);
      let status = 0;

      let request = Object.assign({
        method: 'PUT',
        base: this.url.href,
        params: this.options.params,
        responseType: "stream"
      }, options.http);

      if (!request.auth && auth.has(this.url)) {
        let cred = auth.recall(this.url) || {};
        request.auth = cred.auth?.username + ":" + cred.auth?.password;
      }

      // headers set below from HTML form data

      // smt.locus is source folder
      let smt = new SMT(options.smt);
      let folder = smt.locus.startsWith("file:") ? smt.locus.substring(5) : smt.locus;
      let src = path.join(folder, options.entry.rpath);

      let filename = (options.use_rpath ? options.entry.rpath : options.entry.name);
      let dest = this.url.pathname + filename.split(path.sep).join(path.posix.sep);
      logger.verbose("http  " + src + " >> " + dest);

      const form = new FormData();
      for (let [ n, v ] of Object.entries(options.formdata))
        form.append(n, v);
      form.append(filename, fs.createReadStream(src));

      // send the file
      request.headers = Object.assign({},
        this._headers,
        options.http?.headers,
        form.getHeaders());

      let response = await httpRequest(this.url.pathname, request, form);

      status = response.status;
      return new StorageResults(status);
    }
    catch (err) {
      let sterr = new StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }
  }

  /**
   * Convert a HTTP error into a StorageResponse
   *
   * @param {*} err a HTTP error object
   * @returns a new StorageError object
   */
  StorageError(err) {
    if (err instanceof StorageError)
      return err;

    return new StorageError(err.statusCode, err.statusMessage, { cause: err });
  }

};
