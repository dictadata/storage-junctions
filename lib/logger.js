/**
 * logger.js
 */
"use strict";

const winston = require('winston');

const _level = process.env.LOG_LEVEL || 'info';

winston.configure({
  level: _level,
  transports: [
    new winston.transports.Console({format: winston.format.simple()})
  ]
});

module.exports = winston;
