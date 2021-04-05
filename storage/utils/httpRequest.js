// storage/utils/httpRequest
"use strict";

const http = require('http');
const https = require('https');
const http2 = require('http2');
const logger = require('./logger');

function httpRequest(url, options, data) {

  let Url;
  if (typeof url === "string") {
    Url = new URL(url, (options.base || options.origin));
  }
  else if (typeof url === "object" && url instanceof URL)
    Url = url;
  else {
    throw new Error(`Invalid url ${url}`);
  }

  if (options.httpVersion === 2)
    return http2Request(Url, options, data);
  else
    return http1Request(Url, options, data);
}

module.exports = exports = httpRequest;

function http1Request(Url, options, data) {
  return new Promise((resolve, reject) => {
    let response = {
      data: ""
    };

    var request = {
      method: (options.method && options.method.toUpperCase()) || "GET",
      host: Url.hostname,
      port: Url.port,
      path: Url.pathname,
      timeout: options.timeout || 5000
    };
    request.headers = Object.assign({}, options.headers);
    if (options.cookies)
      request.headers["Cookie"] = Object.entries(options.cookies).join('; ');
    // If no Content-Length header is sent 
    // then data is sent using chunked encoding (default )
    //if (data)
    //  options.headers['Content-Length'] = Buffer.byteLength(data);
    
    let _http = (Url.protocol === "https:") ? https : http;

    const req = _http.request(request, (res) => {
      response.statusCode = res.statusCode;
      response.headers = res.headers;
      saveCookies(options, res.headers);

      if (options.responseType !== 'stream') {
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          response.data += chunk;
        });

        res.on('end', () => {
          logger.debug(`\n${response.data}`);
          resolve(response);
        });
      }
    });

    if (options.responseType === 'stream') {
      req.on('response', (response) => {
        resolve(response);
      });
    }

    req.on('error', (err) => {
      logger.error(err);
      reject(err);
    });

    if (data)
      req.write(data);
    req.end();
  });
}

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
      request["cookie"] = Object.entries(options.cookies).join('; ');

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

function saveCookies(options, headers) {
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
            options.cookies[ck[0]] = ck[1];
          }
        }
      }
    }
  }
}

exports.contentTypeIsJSON = (contentType) => {
  let expressions = contentType.split(';');

  let [type, value] = expressions[0].split('/');
  if (value === 'json')
    return true;
  if (value.indexOf("+json") >= 0)
    return true;
  
  return false;
}
