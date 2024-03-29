// storage/utils/httpRequest
"use strict";

const http = require('node:http');
const https = require('node:https');
const http2 = require('node:http2');
const zlib = require('node:zlib');
const logger = require('./logger');

/**
 * httpRequest takes some Axios style request config options.
 * These request options are coverted to Node.js options for HTTP, HTTPS, HTTP/2
 *
 * @param {*} url The absolute or relative input URL to options.
 * @param {*} request HTTP options parameters.
 * @param {*} request.base URL to use as base for requests if url is relative.
 * @param {*} request.params object containing URL querystring parameters.
 * @param {*} request.httpVersion HTTP version to use 1.0, 1.1, 2
 * @param {*} request.method HTTP options method, default is GET
 * @param {*} request.timeout options timeout ms, default 5000ms
 * @param {*} request.headers HTTP options headers
 * @param {*} request.cookies array of HTTP cookies strings
 * @param {*} request.auth Basic authentication i.e. 'user:password' to compute an Authorization header.
 * @param {*} request.responseType If set to 'stream' the response will be returned when headers are received.
 * @param {*} data
 * @returns
 */
function httpRequest(url, request, data) {

  if (typeof url === "undefined")
    url = '';

  let Url;
  if (typeof url === "string") {
    Url = new URL(url, request.base);
  }
  else if (typeof url === "object" && url instanceof URL)
    Url = url;
  else {
    throw new StorageError(`Invalid url ${url}`);
  }

  if (request.params) {
    for (const [ name, value ] of Object.entries(request.params))
      Url.searchParams.append(name, value);
  }

  if (request.httpVersion === 2)
    return http2Request(Url, request, data);
  else
    return http1Request(Url, request, data);
}

module.exports = exports = httpRequest;

/**
 *
 * @param {*} Url
 * @param {*} request
 * @param {*} data
 * @returns
 */
function http1Request(Url, request, data) {
  return new Promise((resolve, reject) => {
    let response = {
      data: ""
    };

    var options = {};
    options.method = request.method?.toUpperCase() || "GET";
    options.timeout = request.timeout || 5000;
    options.headers = Object.assign({}, request.headers);
    if (request.cookies)
      options.headers[ "Cookie" ] = Object.entries(request.cookies).join('; ');
    if (request.auth)
      options[ "auth" ] = request.auth;

    if (data) {
      // check for web form data
      if (options.headers[ "Content-Type" ] == "application/x-www-form-urlencoded" && typeof data === "object") {
        data = (new URLSearchParams(data)).toString();
      }

      // default to json payload
      if (!options.headers[ 'Content-Type' ])
        options.headers[ "Content-Type" ] = "application/json; charset=utf-8";

      //options.headers['Content-Length'] = Buffer.byteLength(data);
      // if Content-Length is not set then default is chunked encoding
    }

    let _http = (Url.protocol === "https:") ? https : http;

    const req = _http.request(Url, options, (res) => {
      response.httpVersion = res.httpVersion;
      response.statusCode = res.statusCode;
      response.statusMessage = res.statusMessage;
      response.headers = res.headers;
      if (request.cookies)
        saveCookies(request, res.headers);

      if (request.responseType !== 'stream') {
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
              throw new StorageError(`unkonwn content-encoding: ${encoding}`);
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

    if (request.responseType === 'stream') {
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

    req.on('error', (err) => {
      logger.warn(err.message);
      reject(err);
    });

    // stream the request data
    if (data)
      req.write(data);
    // finish the request
    req.end();
  });
}

/**
 * !!! this is probably broken !!!
 * @param {*} Url
 * @param {*} request
 * @param {*} data
 * @returns
 */
function http2Request(Url, request, data) {
  return new Promise((resolve, reject) => {
    let response = {};

    const client = http2.connect(Url);

    client.on('error', (err) => {
      logger.warn(err.message);
      reject(err);
    });

    let options = Object.assign({
      ':method': request.method || 'GET',
      ':path': Url.path || ''
    }, request.headers);

    if (request.cookies)
      options[ "cookie" ] = Object.entries(request.cookies).join('; ');
    if (request.auth)
      options[ "auth" ] = request.auth;
    if (request.params)
      options[ "params" ] = request.params;

    const req = client.request(options);

    req.setEncoding('utf8');
    if (data)
      req.write(data);
    req.end();

    req.on('response', (headers, flags) => {
      response.headers = headers;
      if (request.cookies)
        saveCookies(request, headers);
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
 * @param {*} request
 * @param {*} headers
 */
function saveCookies(request, headers) {
  if (!request.cookies)
    return;

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
            request.cookies[ ck[ 0 ] ] = ck[ 1 ];
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
};
