"use strict";

const transfer = require('./_transfer');

console.log("=== Test: rest");

async function tests() {

  transfer({
    src_smt: "rest|https://iportal.panerabread.com/apis/franchise/PANSI001/reporting/foodusage|/period/8|=cafeNumber",
    src_options: {
      //baseUrl: 'https://iportal.panerabread.com/apis/franchise/PANSI001/reporting/foodusage',
      auth: {
        username: 'api_user_remediumslbofiowa',
        password: '3c7da24b-5c69-4cf4-b551-eef47cf1c247'
      },
      //url: '/period/8',
      params: {
        cafeNumber: '203201'
      }
    },
    dst_smt: "csv|./test/output/|rest_output.csv|*"
  });

}

tests();
