/**
 * storage/filesystems
 */
"use strict";

const { StorageError } = require("../types");

class FileSystems {

  /**
   * register filesystem prefix with a filesystem class
   * @param {string} fsPrefix filesystem prefix like file, http, ftp, s3, ...
   * @param {StorageFileSystem} FileSystemsClass
   */
  static use(fsPrefix, FileSystemsClass) {
    // need to do some validation
    FileSystems._fileSystems.set(fsPrefix, FileSystemsClass);
  }

  static async activate(smt, options) {
    if (!smt)
      throw new StorageError(400, "invalid smt");

    let fsPrefix = 'file';
    if (smt.locus.indexOf(':') > 1)
      fsPrefix = smt.locus.split(':')[ 0 ].toLowerCase();

    if (FileSystems._fileSystems.has(fsPrefix)) {
      let stfs = new (FileSystems._fileSystems.get(fsPrefix))(smt, options);
      await stfs.activate();
      return stfs;
    }
    else
      throw new StorageError(400, "Unknown FileSystem type: " + fsPrefix);
  }

  static async relax(stfs) {
    if (stfs?.relax)
      await stfs.relax();
  }

}

// FileSystems static properties
FileSystems._fileSystems = new Map();

module.exports = exports = FileSystems;
