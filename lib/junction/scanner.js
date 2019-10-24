/**
 * junction/scanner
 * default file scanner
 */
/* eslint-disable arrow-parens */

const StorageError = require('../storage_error');

const fs = require('fs').promises;
const path = require('path');

const models = ['csv','json'];  // supported models for filesystem scans


module.exports = async (smt, options) => {

  if (!smt)
    throw new StorageError({statusCode: 400}, "invalid smt");

  if (!models.includes(smt.model))
    throw new StorageError({statusCode: 400}, "invalid model");

  if (smt.schema.indexOf('*') < 0)
    throw new StorageError({statusCode: 400}, "invalid schema, must be wildcard");

  options.filespec = smt.schema;

  if (smt.locus.indexOf('S3:') === 0 || smt.locus.indexOf('s3:') === 0)
    return s3_scan(smt.locus, options);

  return fs_scan(smt.locus, options);
};

async function fs_scan(dirpath, options) {
  let list = [];

  try {
    let rx = '^' + options.filespec + '$';
    rx = rx.replace('.','\\.');
    rx = rx.replace('*','.*');
    rx = new RegExp(rx);

    let dir = await fs.opendir(dirpath);
    for await (let dirent of dir) {
      if (dirent.isDirectory() && options.recursive) {
        var subpath = path.join(dirpath, dirent.name);
        list.push( ...await fs_scan(subpath,options) );
      }
      else if (dirent.isFile() && dirent.name.match(rx)) {
        let fullpath = path.join(dirpath,dirent.name);
        list.push(fullpath);
        if (options.callback)
          options.callback(fullpath);
      }
    }
    //await dir.close();
  }
  catch (err) {
    logger.error(err.message);
  }

  return list;
}

async function s3_scan(options) {
  var list = [];

  return list;
}
