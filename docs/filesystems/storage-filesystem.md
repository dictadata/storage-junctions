# dictadata/storage/filesystems/storage-filesystem

```javascript
class StorageFileSystem {

/*
 * construct a StorageFileSystem object
 * @param {*} smt storage memory trace
 * @param {*} options filesystem options
 */
  constructor(smt, options)

/*
 * Initialize or connect to the filesystem
 */
  async activate()

/**
 * Diconnect and/or cleanup resources
 */
  async relax()

/**
 * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
 * @param {object} options Specify any options use when querying the filesystem.
 * @param {string} options.schema Override smt.schema, my contain wildcard characters.
 * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
 * @param {function} options.forEach Function to execute with each entry object, optional.
 * @returns StorageResponse object where data is an array of directory entry objects.
 */
  async list(options)

/**
 * Remove schema, i.e. file(s), on the filesystem.
 * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
 * @param {*} options Specify any options use when querying the filesystem.
 * @param {*} options.schema Override smt.schema with a filename in the same locus.
 * @returns StorageResponse object with resultCode.
 */
  async dull(schema)

/**
 * Create an object mode readstream from the filesystem file.
 * @param {*} options Specify any options use when querying the filesystem.
 * @param {*} options.schema Override smt.schema with a filename in the same locus.
 * @returns a node.js readstream based object if successful.
 */
  async createReadStream(options)

/**
 * Create an object mode writestream to the filesystem file.
 * @param {*} options Specify any options use when querying the filesystem.
 * @param {*} options.schema Override smt.schema with filename at the same locus.
 * @param {*} options.append Flag used indicate overwrite or append destination file. Default is overwrite.
 * @returns a node.js writestream based object if successful.
 */
  async createWriteStream(options)

/**
 * Download a file from remote filesystem to local filesystem.
 * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
 * @param {object} options.entry Directory entry object containing the file information.
 * @param {SMT} options.smt smt.locus specifies the output folder in the local filesystem.
 * @param {boolean} options.use_rpath If true replicate folder structure of remote filesystem in local filesystem.
 * @returns StorageResponse object with resultCode;
 */
  async geFile(options)

/**
 * Upload a local file to the remote filesystem.
 * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
 * @param {SMT} options.smt smt.locus specifies the source folder in the local filesystem.
 * @param {object} options.entry Directory entry object containing the file information.
 * @param {boolean} options.use_rpath If true replicate folder structure of local filesystem in remote filesystem.
 * @returns StorageResponse object with resultCode.
 */
  async putFile(options)

}
```
