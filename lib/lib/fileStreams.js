/**
 * lib/fileStreams
 */
"use strict";

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const AWS = require("aws-sdk");

//const DuplexStream = require('./duplexStream');
const { PassThrough } = require('stream');

/**
* createReadStream
*/
exports.createReadStream = async (smt, options) => {
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

  return rs;
};

/**
* createWriteStream
*/
exports.createWriteStream = async (smt, options) => {
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

    try {
      var info = await s3.headObject(s3params).promise();
      options.isNewFile = false;
    }
    catch (err) {
      options.isNewFile = true;
    }

    //ws = new DuplexStream();
    ws = new PassThrough();
    s3params['Body'] = ws;
    let data = ws.SendData = await s3.upload(s3params);
    //console.log(data);
  }
  else {
    // default to local file path or file: URL
    var filename = path.join(smt.locus, smt.schema) || '';
    options.isNewFile = !options.append || !await fsp.access(filename, fs.constants.R_OK | fs.constants.W_OK);

    let flags = options.append ? 'a' : 'w';
    ws = fs.createWriteStream(filename, { flags: flags });
  }

  return ws;
};
