// storage/types/StorageError
"use strict";

const { typeOf } = require("../utils");
const StorageResults = require("./storage-results");

module.exports = exports = class StorageError extends Error {
  constructor(resultCode, ...params) {
    // Pass normal error arguments to parent constructor
    super(...params);

    this.name = 'StorageError';

    // StorageError result information
    this.resultCode = resultCode;
    if (!this.message)
      this.message = StorageResults.RESULT_CODES[this.resultCode] || 'unknown error';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

  inner(error) {
    this.innerError = error;
    return this;
  }
}
