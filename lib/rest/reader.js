"use strict";

const StorageReader = require('../junction/reader');
const Encoding = require('../encoding');
const Axios = require("axios");

module.exports = class RestReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

    //this.baseUrl = options.baseUrl;

    // update engram
    this._encoding.location = this.baseUrl;
    //this._encoding.container = ;
    this._encoding.key = '*';

    // get rid of this!
    //this._options.username = 'api_user_remediumslbofiowa';
    //this._options.password = '3c7da24b-5c69-4cf4-b551-eef47cf1c247';
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    console.log('Rest _read');

    let axiosOptions = {
      baseURL: this._options.baseUrl,
      timeout: 10000,
      headers: {'Accept': 'application/json'},
      auth: {
        username: this._options.username,
        password: this._options.password
      }
    };

    // read up to size constructs
    try {
      let axios = Axios.create({ axiosOptions });
      let response = await axios.get(this.baseUrl);
      let results = response.data;

      for (let i = 0; i < results.length; i++) {
        let construct = results[i];
        this.push(construct);
      }

    }
    catch(err) {
      console.log(err);
      this._logger.error(err.message);
    }

    // when done reading from source
    this.push(null);
  }

};
