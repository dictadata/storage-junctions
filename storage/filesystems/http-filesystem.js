// filesystems/http-filesystem
"use strict";

const StorageFileSystem = require("./storage-filesystem");
const { StorageResults, StorageError } = require("../types");
const { logger, httpRequest } = require("../utils");

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const HTMLParser = require('node-html-parser');
const FormData = require('form-data');


module.exports = exports = class HTTPFileSystem extends StorageFileSystem {

  /**
   *
   * @param {*} SMT  example "model|url folder|filename|*"
   * @param {*} options  http connection options, headers and cookies
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("HTTPFileSystem");

    if (!this.options.origin)
      this.options.origin = this._url.origin;
    if (!this.options.dirname)
      this.options.dirname = this._url.pathname;
    if (!this.options.dirname.endsWith('/'))
      this.options.dirname += '/';

    // set some default request headers, if not defined in options
    this.headers = Object.assign({
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      "user-agent": "storage-junctions/1.2 (dictadata.org)",
      'cache-control': 'max-age=0'
    },
      this.options.headers);
    delete this.options.headers;  // beware shallow copies

    this._dirname = '';
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
    logger.debug('http-filesystem list');

    try {
      options = Object.assign({}, this.options, options);
      options.method = 'GET';
      options.headers = Object.assign({}, this.headers, options.headers, {
        accept: 'text/html,application/xhtml+xml'
      });
      let schema = options.schema || this.smt.schema;
      let dirpath = this.options.dirname || "/";
      let list = [];
        
      // regex for filespec match
      let filespec = schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      let that = this;

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      async function scanner(dirpath) {
        logger.debug('scanner');

        // HTTP GET
        let response = await httpRequest(dirpath, options);
        logger.debug(response);

        if (!response.headers['content-type'].startsWith('text/html'))
          throw new StorageError(400, 'invalid content-type');

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
        var directory = that._parseHtmlDir(response, pre[0].rawText);
        logger.debug(JSON.stringify(directory, null, 2));

        for (let entry of directory) {
          if (entry.isDir && that.options.recursive) {
            let subpath = dirpath + entry.href;
            if (entry.href.startsWith('/'))
              subpath = entry.href;
            await scanner(subpath);
          }
          else if (!entry.isDir && rx.test(entry.name)) {
            logger.debug(JSON.stringify(entry, null, 2));

            entry.rpath = dirpath + entry.name;
            if (entry.rpath.startsWith(that.options.dirname))
              entry.rpath = entry.rpath.substring(that.options.dirname.length);

            if (that.options.forEach)
              await that.options.forEach(entry);
            list.push(entry);
          }
        }
      }

      await scanner(dirpath);

      return new StorageResults(0, null, list);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async dull(options) {
    logger.debug('http-filesystem dull');

    options = Object.assign({}, this.options, options);
    options.headers = Object.assign({}, this.headers, options.headers);
    let schema = options.schema || this.smt.schema;

    throw new StorageError(501);

    //return new StorageResults(0);
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("HTTPFileSystem createReadStream");

    try {
      options = Object.assign({}, this.options, options);
      options.headers = Object.assign({}, this.headers, options.headers);
      options.method = 'GET'
      options.responseType = 'stream';

      let rs = null;
      let schema = options.schema || this.smt.schema;
      let filename = this.options.dirname + schema;

      // create read stream
      rs = await httpRequest(filename, options);

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createUnzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
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
    logger.debug("HTTPFileSystem createWriteStream");
    throw new StorageError(501);

    // implement writestream creation in overrides
    //options = Object.assign({}, this.options, options);
    //options.headers = Object.assign({}, this.headers, options.headers);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    //this._isNewFile = true | false

    //return ws;
  }

  async download(options) {
    logger.debug("HTTPFileSystem download");

    try {
      options = Object.assign({}, this.options, options);
      options.headers = Object.assign({}, this.headers, options.headers);
      options.method = 'GET'
      options.responseType = 'stream';
      let resultCode = 0;

      let src = options.dirname + options.rpath;
      let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));
      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      // get file
      let rs = await httpRequest(src, options);

      // save to local file
      await rs.pipe(fs.createWriteStream(dest));

      return new StorageResults(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  async upload(options) {
    logger.debug("HTTPFileSystem upload")

    try {
      options = Object.assign({}, this.options, options);
      options.headers = Object.assign({}, this.headers, options.headers);
      options.method = 'PUT';
      let resultCode = 0;

      let src = path.join(options.uploadPath, options.rpath);
      let filename = (options.useRPath ? options.rpath : options.name);
      let dest = this._url.pathname + filename.split(path.sep).join(path.posix.sep);
      logger.verbose("  " + src + " >> " + dest);

      const form = new FormData();
      for (let [n, v] of Object.entries(options.formdata))
        form.append(n, v);
      form.append(filename, fs.createReadStream(src));

      // send the file
      options.headers = Object.assign({}, this.headers, options.headers, form.getHeaders());
      let response = await httpRequest(this._url.pathname, options, form);

      return new StorageResults(resultCode);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /////// parse HTML directory page

  _parseHtmlDir(response, dirText) {
    let server = response.headers["server"];

    let direxp = null;
    if (this.options.direxp)
      direxp = this.options.direxp;
    if (server.indexOf("IIS") >= 0)
      direxp = /(?<date>.*AM|PM) +(?<size>[0-9]+|<dir>) <A HREF="(?<href>.*)">(?<name>.*)<\/A>/;
    else if (server.indexOf("nginx") >= 0)
      direxp = /<a href="(?<href>.*)">(?<name>.*)<\/a> +(?<date>[0-z,\-]+ [0-9,:]+) +(?<size>.*)/;

    dirText = decodeURI(dirText);
    var lines = dirText.split(/(?:<br>|\n|\r)+/);
    var entries = [];

    for (var i = 0; i < lines.length; i++) {
      var line = this._decodeEntities(lines[i]);

      var m = direxp.exec(line);
      if (m && m.length === 5) {
        let d = m.groups;
        var isDir = Number.isNaN(Number.parseInt(d['size']));

        var direntry = {
          href: d['href'],
          name: d['name'],
          isDir: isDir,
          date: new Date(d['date']),
          size: isDir ? 0 : parseInt(d['size'])
        };

        entries.push(direntry);
      }
    }

    return entries;
  }

  _decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
      "nbsp": " ",
      "amp": "&",
      "quot": "\"",
      "lt": "<",
      "gt": ">"
    };

    return encodedString.replace(translate_re, function (match, entity) {
      return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
  }

};
