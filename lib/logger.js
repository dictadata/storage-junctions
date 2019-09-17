/**
 * logger.js
 */
"use strict";

const winston = require('winston');

winston.configure({
  transports: [
    new winston.transports.Console({format: winston.format.simple()})
  ]
});

module.exports = winston;
