// filesystems/http-filesystem
"use strict";

const StorageFileSystem = require("../storage-filesystem");
const { StorageError } = require("../types");
const logger = require("../logger");

const http = require('http');
const http2 = require('http2');
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

    // default request headers, override with options.headers
    this.headers = Object.assign({
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      "user-agent": "storage-junctions/1.2 (dictadata.org)",
      'cache-control': 'max-age=0'
    },
      this.options.headers);

    this.cookies = Object.assign({}, this.options.cookies);
    this.response = {};
    this._dirname = '';
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
    logger.debug('http-filesystem list');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let dirpath = this.options.dirname || "/";
    let list = [];

    // regex for filespec match
    let filespec = schema || '*';
    let rx = '^' + filespec + '$';
    rx = rx.replace('.', '\\.');
    rx = rx.replace('*', '.*');
    rx = new RegExp(rx);

    try {
      let that = this;

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      async function scanner(dirpath) {
        logger.debug('scanner');

        // HTTP GET
        that.options.method = 'GET';
        let content = await that._httpRequest(dirpath, {
          method: "GET",
          headers: {
            accept: 'text/html,application/xhtml+xml'
          }
        });
        logger.debug(content);

        if (!that.response.headers['content-type'].startsWith('text/html'))
          throw new StorageError({ statusCode: 400 }, 'invalid content-type');

        // parse the html page into a simple DOM
        var root = HTMLParser.parse(content, {
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
        var directory = that._parseHtmlDir(pre[0].rawText);
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
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return list;
  }

  async dull(options) {
    logger.debug('http-filesystem dull');

    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    throw new StorageError({ statusCode: 501 }, "StorageFileSystem.dull method not implemented");

    //return "ok";
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("HTTPFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = this.options.dirname + schema;

      // create read stream
      rs = await this._httpRequest(filename, { method: 'GET', responseType: 'stream' });

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
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
    logger.debug("HTTPFileSystem createWriteStream");
    throw new StorageError({ statusCode: 501 }, "HTTPFileSystem.createWriteStream method not implemented");

    // implement writestream creation in overrides
    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    //this._isNewFile = true | false

    //return ws;
  }

  async download(options) {
    logger.debug("HTTPFileSystem download");
    options = Object.assign({}, this.options, options);
    const link = options.link || options.href || this.smt.schema;
    let result = true;

    try {
      let src = options.dirname + options.rpath;
      let dest = path.join(options.downloads, (options.useRPath ? options.rpath : options.name));
      let dirname = path.dirname(dest);
      if (dirname !== this._dirname && !fs.existsSync(dirname)) {
        await mkdir(dirname, { recursive: true });
        this._dirname = dirname;
      }
      logger.verbose("  " + src + " >> " + dest);

      // get file
      let rs = await this._httpRequest(src, { method: 'GET', responseType: 'stream' });

      // save to local file
      rs.pipe(fs.createWriteStream(dest));
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }

  async upload(options) {
    logger.debug("HTTPFileSystem upload")

    options = Object.assign({}, this.options, options);
    let result = false;

    try {
      let src = path.join(options.uploadPath, options.rpath);
      let filename = (options.useRPath ? options.rpath : options.name);
      let dest = this._url.pathname + filename.split(path.sep).join(path.posix.sep);
      logger.verbose("  " + src + " >> " + dest);

      const form = new FormData();
      for (let [n, v] of Object.entries(options.formdata))
        form.append(n, v);

      form.append(filename, fs.createReadStream(src));

      this._httpRequest(this._url.pathname, { method: 'POST', headers: form.getHeaders() }, form);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }

  /////// HTTP requests

  async _httpRequest(rpath, options) {
    if (this.options.http === 2)
      return this._http2Request(rpath, options);
    else
      return this._http1Request(rpath, options);
  }

  async _http1Request(rpath, options, data) {
    return new Promise((resolve, reject) => {
      this.response = {
        data: ""
      };

      let Url;
      try {
        Url = new URL(rpath, this.options.origin || this.smt.locus);
      } catch (error) {
        throw new Error(`Invalid url ${rpath}`);
      }
      
      var request = {
        method: (options.method && options.method.toUpperCase()) || "GET",
        host: Url.hostname,
        port: Url.port,
        path: Url.pathname,
        timeout: options.timeout || 5000
      };
      request.headers = Object.assign({}, this.headers, options.headers);
      if (this.cookies)
        request.headers["Cookie"] = Object.entries(this.cookies).join('; ');
      if (data)
        options.headers['Content-Length'] = Buffer.byteLength(data);
      
      const req = http.request(request, (res) => {
        this.response.statusCode = res.statusCode;
        this.response.headers = res.headers;
        this._saveCookies(res.headers);
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          this.response.data += chunk;
        });

        res.on('end', () => {
          logger.debug(`\n${this.response.data}`);
          resolve(this.response.data);
        });
      });

      req.on('error', (e) => {
        logger.error(err);
        reject(err);
      });

      if (data)
        req.write(data);
      req.end();      
    });
  }

  _http2Request(rpath, options, data) {
    return new Promise((resolve, reject) => {
      this.response = {};

      const client = http2.connect(this.options.origin || this.smt.locus);

      client.on('error', (err) => {
        logger.error(err);
        reject(err);
      });

      let request = Object.assign({
        ':method': this.options.method || 'GET',
        ':path': rpath || ''
      },
        this.options.headers);
      if (this.options.cookies)
        request["cookie"] = Object.entries(this.options.cookies).join('; ');

      const req = client.request(request);

      req.setEncoding('utf8');
      req.end();

      req.on('response', (headers, flags) => {
        this.response.headers = headers;
        this._saveCookies(headers);
      });

      req.on('data', (chunk) => {
        this.response.data += chunk;
      });

      req.on('end', () => {
        logger.debug(`\n${this.response.data}`);
        client.close();
        resolve(this.response.data);
      });

    });
  }

////////////////////////////////
  
  _saveCookies(headers) {
    // parse cookies
    for (const name in headers) {
      logger.debug(`${name}: ${headers[name]}`);
      if (name === "set-cookie") {
        let cookies = [];
        let hdval = headers[name];
        if (typeof hdval === 'string')
          cookies.push(hdval);
        else
          cookies = hdval;

        for (let cookie of cookies) {
          let nvs = cookie.split(';');
          if (nvs.length > 0) {
            let ck = nvs[0].split('=');
            if (ck.length > 0) {
              logger.debug(ck[0] + '=' + ck[1]);
              this.cookies[ck[0]] = ck[1];
            }
          }
        }
      }
    }
  }

  /////// parse HTML directory page

  _parseHtmlDir(dirText) {
    let server = this.response.headers["server"];

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
