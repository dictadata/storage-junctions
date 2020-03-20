/**
 * scanner/fileStreams
 */
"use strict";

const logger = require('../logger');

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { PassThrough } = require('stream');

const AWS = require("aws-sdk");

/**
 *
 * @param {*} smt
 */
function s3params(smt) {

  var s3path = smt.locus.substring(3);  // remove "S3:"
  var bucket = s3path;
  var prefix = '';

  // split path from bucket name
  let p = s3path.indexOf('/');
  if (p > 0) {
    bucket = s3path.substring(0, p);
    prefix = s3path.substring(p + 1);
  }

  if (prefix && !prefix.endsWith('/') && !smt.schema.startsWith('/'))
    prefix = prefix + '/';

  return {
    Bucket: bucket,
    Key: prefix + smt.schema
  };
}


/**
* createReadStream
*/
exports.createReadStream = async (smt, options) => {
  logger.debug("fileStreams createReadStream");
  let rs = null;

  ///// S3 bucket
  if (smt.locus.indexOf('S3:') === 0 || smt.locus.indexOf('s3:') === 0) {
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: (options.aws && options.aws.accessKeyId) || '',
      secretAccessKey: (options.aws && options.aws.secretAccessKey) || '',
      region: (options.aws && options.aws.region) || 'us-east-1'
    });

    let params = s3params(smt);
    rs = await s3.getObject(params).createReadStream();
  }
  else {
    ///// local file system or file: URL
    var filename = path.join(smt.locus, smt.schema) || '';
    rs = fs.createReadStream(filename);
  }

  ///// check for zip
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

  ///// S3 bucket
  if (smt.locus.indexOf('S3:') === 0 ||smt.locus.indexOf('s3:') === 0) {
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: (options.aws && options.aws.accessKeyId) || '',
      secretAccessKey: (options.aws && options.aws.secretAccessKey) || '',
      region: (options.aws && options.aws.region) || 'us-east-1'
    });

    ws = new PassThrough();   // write to transform, s3.upload reads from transform
    options.isNewFile = true; // can't append to S3 objects

    let params = s3params(smt);
    params['Body'] = ws;
    ws.s3upload = s3.upload(params).promise();
  }
  else {
    ///// local filesystem or file: URL
    var filename = path.join(smt.locus, smt.schema) || '';
    options.isNewFile = !(options.append && fs.existsSync(filename));

    let flags = options.append ? 'a' : 'w';
    ws = fs.createWriteStream(filename, { flags: flags });
  }

  ///// check for zip
  if (smt.schema.endsWith('.gz')) {
    var gzip = zlib.createGzip();
    gzip.pipe(ws);
    return gzip;
  }

  return ws;
};
