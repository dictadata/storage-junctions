// storage/types/StorageError
"use strict";

const { typeOf } = require("../utils");
const StorageResponse = require("./storage-response");

module.exports = exports = class StorageError extends Error {
  constructor(resultCode, ...params) {
    // Pass normal error arguments to parent constructor
    super(...params);

    this.name = 'StorageError';

    // StorageError result information
    this.resultCode = resultCode;
    if (!this.message)
      this.message = StorageResponse.RESULT_CODES[this.resultCode] || 'unknown error';

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
