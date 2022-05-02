// storage/utils/httpRequest
"use strict";

const http = require('http');
const https = require('https');
const http2 = require('http2');
const querystring = require('querystring');
const zlib = require('zlib');
const logger = require('./logger');

/**
 *
 * @param {*} url The absolute or relative input URL to request.
 * @param {*} options HTTP request parameters.
 * @param {*} options.base URL to use as base for requests if url is relative.
 * @param {*} options.query object containing URL querystring parameters.
 * @param {*} options.httpVersion HTTP version to use 1.0, 1.1, 2
 * @param {*} options.method HTTP request method, default is GET
 * @param {*} options.timeout request timeout ms, default 5000ms
 * @param {*} options.headers HTTP request headers
 * @param {*} options.cookies array of HTTP cookies strings
 * @param {*} options.auth Basic authentication i.e. 'user:password' to compute an Authorization header.
 * @param {*} options.responseType If set to 'stream' the response will be returned when headers are received.
 * @param {*} data
 * @returns
 */
function httpRequest(url, options, data) {

  if (typeof url === "undefined")
    url = '';

  let Url;
  if (typeof url === "string") {
    Url = new URL(url, options.base);
  }
  else if (typeof url === "object" && url instanceof URL)
    Url = url;
  else {
    throw new Error(`Invalid url ${url}`);
  }

  if (options.query) {
    Url.search = querystring.stringify(options.query);
  }

  if (options.httpVersion === 2)
    return http2Request(Url, options, data);
  else
    return http1Request(Url, options, data);
}

module.exports = exports = httpRequest;

/**
 *
 * @param {*} Url
 * @param {*} options
 * @param {*} data
 * @returns
 */
function http1Request(Url, options, data) {
  return new Promise((resolve, reject) => {
    let response = {
      data: ""
    };

    var request = {
      method: (options.method && options.method.toUpperCase()) || "GET",
      timeout: options.timeout || 5000
    };
    request.headers = Object.assign({}, options.headers);
    if (options.cookies)
      request.headers[ "Cookie" ] = Object.entries(options.cookies).join('; ');
    if (options.auth)
      request[ "auth" ] = options.auth;

    if (data) {
      // check for web form data
      if (request.headers[ "Content-Type" ] == "application/x-www-form-urlencoded" && typeof data === "object")
        data = querystring.stringify(data);

      // default to json payload
      if (!request.headers[ 'Content-Type' ])
        request.headers[ "Content-Type" ] = "application/json; charset=utf-8";

      //request.headers['Content-Length'] = Buffer.byteLength(data);
      // if Content-Length is not set then default is chunked encoding
    }

    let _http = (Url.protocol === "https:") ? https : http;

    const req = _http.request(Url, request, (res) => {
      response.statusCode = res.statusCode;
      response.headers = res.headers;
      saveCookies(options, res.headers);

      if (options.responseType === 'stream') {
        // return a read stream

        req.on('response', (rs) => {
          ///// check for zip
          let decoder;
          if (rs.headers[ "content-encoding" ] === 'gzip')
            decoder = zlib.createGunzip({ flush: zlib.constants.Z_PARTIAL_FLUSH });
          else if (rs.headers[ "content-encoding" ] === 'deflate')
            decoder = zlib.createDeflate();
          else if (rs.headers[ "content-encoding" ] === 'br')
            decoder = zlib.createBrotliDecompress();

          if (decoder) {
            rs.pipe(decoder);
            resolve(decoder);
          }
          else
            resolve(rs);
        });
      }
      else {
        // return response body
        var chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          var buffer = Buffer.concat(chunks);

          let encoding = response.headers[ "content-encoding" ];
          if (encoding) {
            if (encoding === 'gzip')
              response.data = zlib.gunzipSync(buffer).toString();
            else if (encoding === 'deflate')
              response.data = zlib.deflateSync(buffer).toString();
            else if (encoding === 'br')
              response.data = zlib.brotliDecompressSync(buffer).toString();
            else
              throw new Error(`unkonwn content-encoding: ${encoding}`);
          }
          else {
            // otherwise assume text
            response.data = buffer.toString();
            logger.debug(`\n${response.data}`);
          }

          resolve(response);
        });
      }
    });

    req.on('error', (err) => {
      logger.error(err);
      reject(err);
    });

    // send the request
    if (data)
      req.write(data);
    req.end();
  });
}

/**
 *
 * @param {*} Url
 * @param {*} options
 * @param {*} data
 * @returns
 */
function http2Request(Url, options, data) {
  return new Promise((resolve, reject) => {
    response = {};

    const client = http2.connect(Url);

    client.on('error', (err) => {
      logger.error(err);
      reject(err);
    });

    let request = Object.assign({
      ':method': options.method || 'GET',
      ':path': Url.path || ''
    },
      options.headers
    );
    if (options.cookies)
      request[ "cookie" ] = Object.entries(options.cookies).join('; ');
    if (options.auth)
      request[ "auth" ] = options.auth;

    const req = client.request(request);

    req.setEncoding('utf8');
    if (data)
      req.write(data);
    req.end();

    req.on('response', (headers, flags) => {
      response.headers = headers;
      saveCookies(options, headers);
    });

    req.on('data', (chunk) => {
      response.data += chunk;
    });

    req.on('end', () => {
      logger.debug(`\n${response.data}`);
      client.close();
      resolve(response);
    });

  });
}

////////////////////////////////

/**
 *
 * @param {*} options
 * @param {*} headers
 */
function saveCookies(options, headers) {
  // parse cookies
  for (const name in headers) {
    logger.debug(`${name}: ${headers[ name ]}`);
    if (name === "set-cookie") {
      let cookies = [];
      let hdval = headers[ name ];
      if (typeof hdval === 'string')
        cookies.push(hdval);
      else
        cookies = hdval;

      for (let cookie of cookies) {
        let nvs = cookie.split(';');
        if (nvs.length > 0) {
          let ck = nvs[ 0 ].split('=');
          if (ck.length > 0) {
            logger.debug(ck[ 0 ] + '=' + ck[ 1 ]);
            options.cookies[ ck[ 0 ] ] = ck[ 1 ];
          }
        }
      }
    }
  }
}

/**
 *
 * @param {*} contentType
 * @returns
 */
exports.contentTypeIsJSON = (contentType) => {
  if (!contentType)
    return false;

  let expressions = contentType.split(';');
  let [ type, value ] = expressions[ 0 ].split('/');
  if (value === 'json')
    return true;
  if (value.indexOf("+json") >= 0)
    return true;

  return false;
}
