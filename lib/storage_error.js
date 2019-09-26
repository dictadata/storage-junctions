/**
 * storage/error
 */
"use strict";

module.exports = class StorageError extends Error {
  constructor(info, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }

    this.name = 'StorageError';

    // Storage debugging information
    if (!info) info = {};
    if (!info.statusCode) info.statusCode = 500;
    Object.assign(this, info);
    //this.date = new Date();
  }
};
