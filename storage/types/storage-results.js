// storage/types/StorageResults
"use strict";

class StorageResults {

  /**
   * The results type returned by storage methods.
   * @param {integer} type_code overloaded, response type OR a HTTP like statusCode
   * @param {string} resultMessage a string with a HTTP like statusMessage
   * @param {*} data an Array or Map of constructs, or single construct
   * @param {*} key optional key for keystores (map) storage sources
   */
  constructor(type_code, resultMessage, data, key) {
    // these four fields MUST be in any serialized (HTTP) response
    this.resultCode = 0;
    this.resultMessage = "";
    this.type;
    this.data;

    if (typeof type_code === "string") {
      // defines data structure type
      switch (type_code) {
        case "index":
        case "map":
          this.type = "map";
          break;
        case "list":
        case "array":
          this.type = "list";
          break;
        case "construct":
          this.type = "construct";
          break;
        case "encoding":
          this.type = "encoding";
          break;
        case "message":
        case "object":
        default:
          this.type = "message";
      }
      type_code = 0; // set to default
    }

    this.setResults(type_code, resultMessage, data, key);
  }

  /**
   * Set result status and optionally add or delete data.
   * @param {*} resultCode the result of the request using HTTP like status codes
   * @param {*} resultMessage if blank will use standard HTTP like messages
   * @param {*} data final data to add; set to null to remove data from response
   * @param {*} key needed for keystore (map) responses
   */
  setResults(resultCode, resultMessage, data, key) {
    this.resultCode = ((resultCode === 200) ? 0 : resultCode) || 0;
    this.resultMessage = resultMessage || StorageResults.RESULT_CODES[ this.resultCode ] || 'unknown';

    if (data) {
      this.add(data, key);
    }
    else if (data === null) {
      this.data = null;
    }
  }

  /**
   * Infer type from values of data and key.
   * Allocates storage for responses.
   * @param {*} data
   * @param {*} key
   */
  _init(data, key) {
    // determine type
    if (!this.type) {
      if (key || data instanceof Map) {
        this.type = "map";
      }
      else if (Array.isArray(data)) {
        this.type = "list";
      }
      else {
        this.type = "message";
      }
      // "construct" and "encoding" types needs to be explicitly set by constructor
    }

    // allocate storage
    switch (this.type) {
      case "map":
        this.data = {};
        break;
      case "list":
        this.data = new Array();
        break;
      case "construct":
      case "encoding":
      case "message":
      default:
        this.data = {};
        // may be assigned (overwritten) in add()
        break;
    }
  }

  /**
   * Add data to the response.
   *   list: data will be pushed onto an array
   *   map: if key provided data added to map, if data is Map then entries assigned to map (object)
   *   construct: assigned as the only data in the response; multiple calls will overwrite response data
   * @param {*} data an Array or Map of constructs, or single construct
   * @param {*} key optional, key for keystores (map) storage sources
   */
  add(data, key) {
    if (!this.data)
      this._init(data, key);

    switch (this.type) {
      case "list":
        if (Array.isArray(data))
          this.data.push(...data);
        else
          this.data.push(data);
        break;
      case "map":
        if (key)
          this.data[ key ] = data;
        else if (data instanceof Map)
          Object.assign(this.data, Object.fromEntries(data.entries()));
        else
          throw new Error("add data missing key value");
        break;
      case "construct":
      case "encoding":
        if (typeof data === "object")
          this.data = Object.assign({}, data);  // replace data
        else
          throw new Error("data type is not supported");
        break;
      case "message":
      default:
        if (key)
          this.data[ key ] = data;
        else if (typeof data === "object")
          this.data = Object.assign(this.data, data); // merge data
        else
          throw new Error("data type is not supported");
        break;
    }
  }

}

StorageResults.RESULT_CODES = {
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

module.exports = exports = StorageResults;
