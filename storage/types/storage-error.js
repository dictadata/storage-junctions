// storage/types/StorageError
"use strict";

const { typeOf } = require("../utils");

class StorageError extends Error {
  constructor(status, ...params) {
    // Pass normal error arguments to parent constructor
    super(...params);

    this.name = 'StorageError';

    // StorageError status information
    if (typeof status === "number")
      this.statusCode = status;
    else if (typeOf(status) === "object")
      Object.assign(this, {statusCode: 500}, status);  // caller should be careful not to accidentially overwrite any standard Error properties

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }

  }
}

module.exports = exports = StorageError;
