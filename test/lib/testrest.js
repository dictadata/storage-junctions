"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');

console.log(">>> Test: rest");

async function test() {

  const pipeline = util.promisify(stream.pipeline);

  try {
    console.log(">>> create junctions");
    var j1 = storage.create("rest|https://iportal.panerabread.com/apis/franchise/PANSI001/reporting/foodusage|/period/8|=cafeNumber", {
      //baseUrl: 'https://iportal.panerabread.com/apis/franchise/PANSI001/reporting/foodusage',
      auth: {
        username: 'api_user_remediumslbofiowa',
        password: '3c7da24b-5c69-4cf4-b551-eef47cf1c247'
      },
      //url: '/period/8',
      params: {
        cafeNumber: '203201'
      }
    });

    var j2 = storage.create("csv|./test/output/|rest_output.csv|*", {
      filename: './test/output/rest_output.csv'
    });

    console.log(">>> get source encoding (codify)");
    let encoding = await j1.getEncoding();

    console.log(">>> encoding results:");
    console.log(encoding);
    //console.log(JSON.stringify(encoding.fields));

    console.log(">>> put destination encoding");
    await j2.putEncoding(encoding);

    console.log(">>> create streams");
    var reader = j1.getReadStream();
    var writer = j2.getWriteStream();

    console.log(">>> start pipe");
    await pipeline(reader, writer);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! pipeline failed', err.message);
  }
}

test();
