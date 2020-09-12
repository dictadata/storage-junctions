"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const Axios = require("axios");
const http2 = require('http2');
const { PassThrough } = require('stream');
const zlib = require('zlib');
const { Resolver } = require("dns");

var HTMLParser = require('node-html-parser');


module.exports = exports = class httpFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT  example "model|url|filename|*"
   * @param {*} options  axios connection options, headers and cookies
   */
  constructor(SMT, options) {
    super(SMT, options);

    logger.debug("httpFileStorage");

    // default request headers, override with options.headers
    this.headers = Object.assign({
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.5',
      'accept-encoding': 'gzip, deflate',
      "user-agent": "dictadata.org/storage-junction",
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
    let list = [];

    try {
      // HTTP GET
      this.options.method = 'GET';
      let content = await this.getHttp();
      console.log(content);

      // parse the page
      var root = HTMLParser.parse(content, {
        lowerCaseTagName: true,  // convert tag name to lower case (hurt performance heavily)
        script: true,             // retrieve content in <script> (hurt performance slightly)
        style: false,             // retrieve content in <style> (hurt performance slightly)
        pre: true,                // retrieve content in <pre> (hurt performance slightly)
        comment: false            // retrieve comments (hurt performance slightly)
      });

      // parse html directory
      // parse the directory
      var pre = root.querySelectorAll('pre');
      var directory = this.parseHtmlDir(pre[0].rawText);
      console.log(JSON.stringify(directory,null,2));

      // check filespec match
      let filespec = options.schema || this.smt.schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      for (let entry of directory) {
        console.log(JSON.stringify(entry,null,2));
      }

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
  async createReadStream() {
    logger.debug("httpFileStorage createReadStream");
    let options = this.options || {};
    let rs = null;

    try {
      let filename = this.smt.schema;
      var axios = await this.activate();

      await axios.get(filename);

      // create read stream
      //rs = await xyz;

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
  async createWriteStream() {
    logger.debug("httpFileStorage createWriteStream");
    let options = this.options || {};
    let ws = false;

    try {
      let filename = this.smt.schema;
      var axios = await this.activate();

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and axios reads from passthrough

      if (options.append) {
      }
      else {
      }

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return ws;
  }

  /////// HTTP requests

  async getHttp() {
    if (this.options.http === 2)
      return this.getHTTP2();
    else
      return this.getHTTP1();
  }

  async getHTTP1() {
    this.response = {};

    try {
      var request = {
        "baseURL": this.options.url || this.smt.locus,
        "headers": this.headers,
        "insecureHTTPParser": true,
        "timeout": 5000
      };
      if (this.cookies)
        request.headers["Cookie"] = Object.entries(this.cookies).join('; ');

      if (this.options.method === 'OPTIONS')
        this.response = await Axios.options(this.options.path, request);
      else
        this.response = await Axios.get(this.options.path, request);
    }
    catch (err) {
      logger.error(err);
    }

    return this.response.data;
  }

  getHTTP2() {
    return new Promise((resolve, reject) => {
      this.response = {};

      const client = http2.connect(this.options.url || this.smt.locus);

      client.on('error', (err) => {
        console.error(err);
        reject(err);
      });

      let request = Object.assign({
        ':method': this.options.method || 'GET',
        ':path': this.options.path || '/'
      }, 
      this.options.headers);
      if (this.options.cookies)
        request["cookie"] = Object.entries(this.options.cookies).join('; ');

      const req = client.request(request);

      req.setEncoding('utf8');
      req.end();

      req.on('response', (headers, flags) => {
        this.response.headers = headers;

        // parse cookies
        for (const name in headers) {
          console.log(`${name}: ${headers[name]}`);
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
                  console.log(ck[0] + '=' + ck[1]);
                  this.cookies[ck[0]] = ck[1];
                }
              }
            }
          }
        }
      });

      req.on('data', (chunk) => {
        this.response.data += chunk;
      });

      req.on('end', () => {
        console.log(`\n${this.response.data}`);
        client.close();
        resolve(this.response.data);
      });

    });
  }

  /////// parse HTML directory page

  decodeEntities(encodedString) {
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

  parseHtmlDir(dirText) {
    dirText = decodeURI(dirText);
    var lines = dirText.split(/(?:<br>|\n|\r)+/);
    var entries = [];

    for (var i = 0; i < lines.length; i++) {
      var line = this.decodeEntities(lines[i]);

      if (line.length > 0 && line[0] !== '<') {
        var d = line.match(/(.{38})(.{13}) <A HREF="(.*)">(.*)<\/A>/);
        var isdir = d[2].indexOf("<dir>") >= 0;

        var direntry = {
          path: d[3],
          name: d[4],
          isDirectory: isdir,
          date: new Date(d[1]),
          size: isdir ? 0 : parseInt(d[2])
        };

        entries.push(direntry);
      }
    }

    return entries;
  }

};
