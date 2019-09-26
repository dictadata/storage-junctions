"use strict";

const StorageReader = require('../junction/reader');
const Axios = require("axios");

module.exports = class RestReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    console.log('REST _read');

    let axiosOptions = {
      baseURL: this._engram.location,
      timeout: this._options.timeout || 10000,
      headers: Object.assign({'Accept': 'application/json'}, this._options.headers),
      auth: this._options.auth || {},
      params: this._options.params || {}
    };
    //auth: {
    //  username: this._options.auth.username,
    //  password: this._options.auth.password
    //}

    let url = this._options.url || this._engram.schema || '/';

    // read up to size constructs
    try {
      //let axios = Axios.create({ axiosOptions });
      //let response = await axios.get(url);
      let response = await Axios.get(url, axiosOptions);
      let headers = response.data.headers;
      let rows = response.data.rows;

      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let construct = {};
        for (let i = 0; i < headers.length; i++) {
          construct[headers[i]] = row[i] || null;
        }
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
