/**
 * lib/fileStreams
 */
"use strict";

const logger = require('../logger');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const AWS = require("aws-sdk");

//const DuplexStream = require('./duplexStream');
const { PassThrough } = require('stream');

/**
* createReadStream
*/
exports.createReadStream = async (smt, options) => {
  logger.debug("fileStreams createReadStream");
  let rs = null;

  if (smt.locus.indexOf('S3:') === 0 || smt.locus.indexOf('s3:') === 0) {
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: (options.aws && options.aws.accessKeyId) || '',
      secretAccessKey: (options.aws && options.aws.secretAccessKey) || '',
      region: (options.aws && options.aws.region) || 'us-east-1'
    });

    var s3params = {
      Bucket: smt.locus.substring(3),
      Key: smt.schema
    };

    rs = await s3.getObject(s3params).createReadStream();
  }
  else {
    // default to local file path or file: URL
    var filename = path.join(smt.locus, smt.schema) || '';
    rs = fs.createReadStream(filename);
  }

  if (smt.schema.endsWith('.gz')) {
    var gzip = zlib.createGunzip();
    rs.pipe(gzip);
    return gzip;
  }

  return rs;
};

/**
* createWriteStream
*/
exports.createWriteStream = async (smt, options) => {
  logger.debug("fileStreams createWriteStream")
  let ws = false;

  if (smt.locus.indexOf('S3:') === 0 ||smt.locus.indexOf('s3:') === 0) {
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: (options.aws && options.aws.accessKeyId) || '',
      secretAccessKey: (options.aws && options.aws.secretAccessKey) || '',
      region: (options.aws && options.aws.region) || 'us-east-1'
    });

    var s3params = {
      Bucket: smt.locus.substring(3),
      Key: smt.schema
    };

    options.isNewFile = true;
    /*
     * can't append to S3 objects
    try {
      var info = await s3.headObject(s3params).promise();
      options.isNewFile = false;
    }
    catch (err) {
      options.isNewFile = true;
    }
    */

    ws = new PassThrough();
    s3params['Body'] = ws;
    ws.s3upload = s3.upload(s3params).promise();
  }
  else {
    // default to local file path or file: URL
    var filename = path.join(smt.locus, smt.schema) || '';
    options.isNewFile = !(options.append && fs.existsSync(filename));

    let flags = options.append ? 'a' : 'w';
    ws = fs.createWriteStream(filename, { flags: flags });
  }

  if (smt.schema.endsWith('.gz')) {
    var gzip = zlib.createGzip();
    gzip.pipe(ws);
    return gzip;
  }

  return ws;
};
