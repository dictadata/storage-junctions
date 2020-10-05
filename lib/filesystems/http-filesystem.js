"use strict";

const FileSystem = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const Axios = require("axios");
const http2 = require('http2');
const zlib = require('zlib');
const path = require('path');
var HTMLParser = require('node-html-parser');


module.exports = exports = class HttpFileSystem extends FileSystem {

  /**
   *
   * @param {*} SMT  example "model|url|filename|*"
   * @param {*} options  axios connection options, headers and cookies
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("HttpFileSystem");

    this.fsType = this.options.fsType || 'http';
    this._fstlen = this.fsType.length + 1;  // http:

    let url = new URL(this.smt.schema, this.smt.locus);
    if (!this.options.origin)
      this.options.origin = url.origin;
    if (!this.options.dirname)
      this.options.dirname = path.dirname(url.pathname);
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
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
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
      this.headers['accept'] = 'text/html,application/xhtml+xml';

      // recursive scanner function
      // eslint-disable-next-line no-inner-declarations
      async function scanner(dirpath) {
        logger.debug('scanner');

        // HTTP GET
        that.options.method = 'GET';
        let content = await that._getHttp(dirpath);
        //console.log(content);

        if (!that.response.headers['content-type'].startsWith('text/html'))
          throw new Error('invalid content-type');

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
        var directory = that._parseHtmlDir(pre[0].rawText);
        //console.log(JSON.stringify(directory,null,2));

        for (let entry of directory) {
          if (entry.isDir && that.options.recursive) {
            let subpath = dirpath + entry.href;
            if (entry.href.startsWith('/'))
              subpath = entry.href;
            await scanner(subpath);
          }
          else if (!entry.isDir && rx.test(entry.name)) {
            //console.log(JSON.stringify(entry,null,2));

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

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("HttpFileSystem createReadStream");
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;
    let rs = null;

    try {
      let filename = this.options.dirname + schema;

      // create read stream
      rs = await this._getHttp(filename, { responseType: 'stream' });

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
    logger.debug("HttpFileSystem createWriteStream");
    throw new StorageError({ statusCode: 501 }, "httpFileStoreage.createWriteStream method not implemented");

    // implement writestream creation in overrides
    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    //this.isNewFile = true | false

    //return ws;
  }

  async download(options) {
    logger.debug("HttpFileSystem download");
    options = Object.assign({}, this.options, options);
    const link = options.link || options.href || this.smt.schema;
    let result = false;

    try {
      // get file
      options.saveFiles = true;
      result = await this._getHttp(options);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return result;
  }

  async upload(options) {
    logger.debug("HttpFileSystem upload")
    throw new StorageError({ statusCode: 501 }, "HttpFileSystem.upload method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return result;
  }

  /////// HTTP requests

  async _getHttp(rpath, options) {
    if (this.options.http === 2)
      return this._getHttp2(rpath, options);
    else
      return this._getHttp1(rpath, options);
  }

  async _getHttp1(rpath, options) {
    this.response = {};

    var request = Object.assign({
      "baseURL": this.options.origin || this.smt.locus,
      "headers": this.headers,
      "timeout": 5000
    },
      options);

    if (this.cookies)
      request.headers["Cookie"] = Object.entries(this.cookies).join('; ');

    if (this.options.method === 'OPTIONS')
      this.response = await Axios.options(rpath, request);
    else
      this.response = await Axios.get(rpath, request);

    this._saveCookies(this.response.headers);

    return this.response.data;
  }

  _getHttp2(rpath) {
    return new Promise((resolve, reject) => {
      this.response = {};

      const client = http2.connect(this.options.origin || this.smt.locus);

      client.on('error', (err) => {
        console.error(err);
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
        //console.log(`\n${this.response.data}`);
        client.close();
        resolve(this.response.data);
      });

    });
  }

  _saveCookies(headers) {
    // parse cookies
    for (const name in headers) {
      //console.log(`${name}: ${headers[name]}`);
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
              //console.log(ck[0] + '=' + ck[1]);
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
