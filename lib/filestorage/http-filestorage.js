"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const Axios = require("axios");
const http2 = require('http2');
const { PassThrough } = require('stream');
const zlib = require('zlib');
const { Resolver } = require("dns");


module.exports = exports = class httpFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT  example "model|url|filename|*"
   * @param {*} options  axios connection options, headers and cookies
   */
  constructor(SMT, options) {
    super(SMT, options);

    logger.debug("httpFileStorage");

    this.headers = Object.assign({}, this.options.headers);
    this.cookies = Object.assign({}, this.options.cookies);
  }

  /**
   *
   * @param {*} options
   */
  async list(options) {
    options = Object.assign({}, this.options, options);
    let list = [];

    try {
      let filespec = options.schema || this.smt.schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      let payload = await this.getHTTP2();
      console.log(payload);

      // parse html directory

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

};


  /////// HTTP requests

  async getHTTP() {
    let response = null;

    try {
      var request = {
        "baseURL": this.options.url || this.smt.locus,
        "headers": {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate',
          "user-agent": "dictadata.org/storage"
        },
        "insecureHTTPParser": true,
        "timeout": 5000
      };
      if (this.options.headers)
        request.headers = Object.assign(request.headers, this.options.headers);
      if (this.options.cookies)
        request.headers["Cookie"] = Object.entries(this.options.cookies).join('; ');

      response = await Axios.get(this.options.path, request);
    }
    catch (err) {
      logger.error(err);
      this.isActive = false;
    }

    return response.data;
  }

  getHTTP2() {
    return new Promise((resolve,reject) => {
      let data = '';

      const client = http2.connect(this.options.url || this.smt.locus);

      client.on('error', (err) => {
        console.error(err);
        reject(err);
      });
      
      let request = {
        ':method': this.options.method || 'GET',
        ':path': this.options.path || '/',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate',
        "user-agent": "dictadata.org/storage"
      };
      if (this.options.headers)
        request = Object.assign(request, this.options.headers);
      if (this.options.cookies)
        request["cookie"] = Object.entries(this.options.cookies).join('; ');


      const req = client.request(request);
      
      req.setEncoding('utf8');
      req.end();    
      
      req.on('response', (headers, flags) => {
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
        data += chunk; 
      });
      
      req.on('end', () => {
        console.log(`\n${data}`);
        client.close();
        resolve(data);
      });
    
    });
  }

  /////// parse HTML directory page

  decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
    };

    return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
  } 

  parseHtmlDir(dirText) {
    dirText = decodeURI(dirText);
    var lines = dirText.split(/(?:<br>|\n|\r)+/);
    var entries = [];

    for (var i = 0; i < lines.length; i++) {
      var line = decodeEntities(lines[i])

      if (line.length > 0 && line[0] !== '<') {
        var d = line.match(/(.{38})(.{13}) <A HREF="(.*)">(.*)<\/A>/)
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

