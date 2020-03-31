/**
 * logger.js
 */
"use strict";

const winston = require('winston');
const { transports, format } = winston;

const _level = process.env.LOG_LEVEL || 'verbose';

winston.configure({
  level: _level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true })
  ),
  transports: [
  ]
});

if (process.env.NODE_ENV === 'development') {
  winston.add(new transports.Console({ format: format.cli() }));
  winston.add(new transports.Console({ format: format.json(), level: 'error' }));
}
else {
  // suppress logger from throwing exceptions
  logger.emitErrs = false;
}

module.exports = exports = winston;
