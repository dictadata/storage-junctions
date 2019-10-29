/**
 * lib/folderScanner
 */
/* eslint-disable arrow-parens */
"use strict";

const StorageError = require('../storage_error');

const fs = require('fs').promises;
const path = require('path');

const AWS = require("aws-sdk");

const models = ['csv', 'json'];  // supported models for filesystem scans


module.exports = async (smt, options) => {

  if (!smt)
    throw new StorageError({ statusCode: 400 }, "invalid smt");

  if (!models.includes(smt.model))
    throw new StorageError({ statusCode: 400 }, "invalid model");

  //if (smt.schema.indexOf('*') < 0)
  //  throw new StorageError({ statusCode: 400 }, "invalid schema, must be wildcard");

  // options needed by scanners
  options.filespec = smt.schema;

  // choose a scanner
  if (smt.locus.indexOf('S3:') === 0 || smt.locus.indexOf('s3:') === 0)
    return s3_scan(smt.locus.substring(3), options);

  // default to local file system
  return fs_scan(smt.locus, options);
};

/**
 * fs_scan is a recursive function
 * @param {*} dirpath
 * @param {*} options
 */
async function fs_scan(dirpath, options) {
  let list = [];

  try {
    let rx = '^' + options.filespec + '$';
    rx = rx.replace('.', '\\.');
    rx = rx.replace('*', '.*');
    rx = new RegExp(rx);

    let dir = await fs.opendir(dirpath);
    for await (let dirent of dir) {
      if (dirent.isDirectory() && options.recursive) {
        var subpath = path.join(dirpath, dirent.name);
        list.push(...await fs_scan(subpath, options));
      }
      else if (dirent.isFile() && dirent.name.match(rx)) {
        let fullpath = path.join(dirpath, dirent.name);
        list.push(fullpath);
        if (options.forEach)
          await options.forEach(fullpath);
      }
    }
    //await dir.close();
  }
  catch (err) {
    logger.error(err.message);
  }

  return list;
}

async function s3_scan(bucket, options) {
  var list = [];

  try {
    let rx = '^' + options.filespec + '$';
    rx = rx.replace('.', '\\.');
    rx = rx.replace('*', '.*');
    rx = new RegExp(rx);

    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: (options.aws && options.aws.accessKeyId) || '',
      secretAccessKey: (options.aws && options.aws.secretAccessKey) || '',
      region: (options.aws && options.aws.region) || 'us-east-1'
    });

    var prefix = '';
    let p = bucket.indexOf('/');
    if ( p > 0 ) {
      prefix = bucket.substring(p + 1);
      bucket = bucket.substring(0, p);
    }
    var s3params = {
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 1000
    };

    //var info = await s3.headBucket(s3params).promise();

    let lastKey = '';
    let done = false;
    while (!done) {
      if (lastKey)
        s3params['StartAfter'] = lastKey;
      var data = await s3.listObjectsV2(s3params).promise();
      if (data.Contents.length === 0 || data.Contents.length < s3params.MaxKeys)
        done = true;
      else
        lastKey = data.Contents[data.Contents.length-1].Key;

      for (let entry of data.Contents) {
        if (entry.Key.charAt(entry.Key.length-1) === '/') {
          continue;
        }
        if (prefix && entry.Key.indexOf(prefix) !== 0)
          continue;
        if (!options.recursive && entry.Key.indexOf('/', prefix.length) >= 0)
          continue;
        if (entry.Key.match(rx)) {
          list.push(entry.Key);
          if (options.forEach)
            await options.forEach(entry.Key);
        }
      }
    }
  }
  catch (err) {
    throw err;
  }

  return list;
}
