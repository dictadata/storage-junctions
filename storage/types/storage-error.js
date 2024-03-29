// storage/types/StorageError
"use strict";

const { typeOf } = require("../utils");
const StorageResults = require("./storage-results");

class StorageError extends Error {

  constructor(status, ...params) {
    // Pass normal error arguments to parent constructor
    super(...params);

    this.name = 'StorageError';

    if (typeof status === "number")
      this.status = status;
    else if (typeof status === "string")
      this.message = status;
    else
      this.cause = status;

    if (!Object.hasOwn(this, "status"))
      this.status = 500;
    if (!Object.hasOwn(this, "message"))
      this.message = StorageResults.RESULT_CODES[ this.status ] || 'unknown error';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (!Object.hasOwn(this, "stack",) && Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

}

Object.defineProperty(StorageError.prototype, 'toJSON', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: function () {
    var obj = {
      name: this.name,
      status: this.status,
      message: this.message,
    };
    if (Object.hasOwn(this, "cause"))
      obj.cause = this.cause;
    if (Object.hasOwn(this, "stack"))
      obj.stack = this.stack;

    /*
    var obj = {};

    // gets all direct properties including non-enumerable properties
    Object.getOwnPropertyNames(this).forEach(function (key) {
      obj[ key ] = this[ key ];
    }, this);
    */

    return obj;
  }
});

module.exports = exports = StorageError;
