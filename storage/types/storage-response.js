// storage/types/StorageResponse
"use strict";

class StorageResponse {

  /**
   * The results type returned by storage methods. Note encoding methods return an Engram object.
   * @param {integer} resultCode a HTTP like statusCode
   * @param {string} resultMessage a string with a HTTP like statusMessage
   * @param {*} data a map or array of constructs
   * @param {*} key the key for keystores storage sources
   */
  constructor(resultCode, resultMessage, data, key) {
    this.resultCode = resultCode || 0;
    if (this.resultCode === 200)
      this.resultCode = 0;
    this.resultMessage = resultMessage || StorageResponse.RESULT_CODES[ this.resultCode ] || 'unknown';

    this.data;
    if (key) {
      this.data = {};
      this.data[ key ] = data;
    }
    else if (Array.isArray(data))
      this.data = data;
    else if (data)
      this.data = [ data ];
    // else no data
  }

  add(data, key) {
    if (!this.data)
      this.data = (key) ? {} : [];

    if (key) {
      this.data[ key ] = data;
    }
    else {

      if (Array.isArray(data))
        this.data = this.data.concat(data);
      else {
        this.data.push(data);
      }
    }
  }

}

StorageResponse.RESULT_CODES = {
  0: "OK",
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Time-out",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Request Entity Too Large",
  414: "Request-URI Too Large",
  415: "Unsupported Media Type",
  416: "Requested range not satisfiable",
  417: "Expectation Failed",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Time-out",
  505: "HTTP Version not supported"
};

module.exports = exports = StorageResponse;
