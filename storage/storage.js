/**
 * Storage/Storage-Storage
 *
 * Static classes implementations.
 *
 *   StorageJunctions
 *   FileSystems
 *   Transforms
 *   Authentication
 */
"use strict";

const Junctions = require('./junctions');
const FileSystems = require('./filesystems');
const Transforms = require('./transforms');
const auth = require('./authentication');
const SMT = require('./types/smt');

const Storage = {};

module.exports = exports = Storage;

Storage.Junctions = Junctions;
Storage.Transforms = Transforms;
Storage.FileSystems = FileSystems;
Storage.auth = auth;
Storage.activate = activateJunction;
Storage.activateJunction = activateJunction;
Storage.getFileSystem = activateFileSystem;
Storage.activateFileSystem = activateFileSystem;
Storage.createTransform = activateTransform;
Storage.activateTransform = activateTransform;


/**
 * Create and activate a StorageJunction given an SMT.
 * Will do Engrams engram and auth lookups.
 *
 * @param {*} smt an SMT name, SMT string or SMT object
 * @param {*} options options to pass to the Storage-junction
 * @returns
 */
async function activateJunction(smt, options) {
  let _smt = {};
  if (!options)
    options = {};

  // SMT string or object
  _smt = new SMT(smt);

  // check for auth options
  if (!options.auth && auth.has(_smt.locus)) {
    let credentials = auth.recall(_smt.locus);
    options = Object.assign(options, credentials);
  }

  // create the junction
  let junction;
  if (_smt.model === "$" && options.junction)
    junction = options.junction;
  else
    junction = Junctions.activate(_smt, options);
  return junction;
}

/**
 * Uses the prefix of smt.locus to determine the filesystem type.
 *
 * file: or (none) local filesystem
 * fs: local filesystem
 * ftp: ftp path, options.ftp contains login information
 * http: or https:
 * s3: s3 bucket/prefix, options.s3.aws_profile contains the section in ~/.aws/credentials
 */
async function activateFileSystem(smt, options) {
  let fileSystem = await FileSystems.activate(smt, options || {});
  return fileSystem;
}

/**
 *
 * @param {String} tfType
 * @param {Object} options
 * @returns
 */
async function activateTransform(tfType, options) {
  let transform = await Transforms.activate(tfType, (options || {}));
  return transform;
}
