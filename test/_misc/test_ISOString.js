#!/usr/bin/env node

let { parseDate } = require('@dictadata/storage-lib/utils');

function test () {
  console.log(parseDate("2019-10-01").toISOString());

  console.log(parseDate("2019-09-30T19:00:00").toISOString());
  console.log(parseDate("2019-10-01T00:00:00Z").toISOString());

  console.log(parseDate("2019-09-30T19:00:00.555").toISOString());
  console.log(parseDate("2019-10-01T00:00:00.555Z").toISOString());

  console.log(parseDate("2019-10-01T05:00:00.000+05:00").toISOString());
  console.log(parseDate("2019-09-30T19:00:00.000-05:00").toISOString());

  console.log(parseDate("2019-10-01T04:15:00.000+04:15").toISOString());
  console.log(parseDate("2019-09-30T19:30:00.000-04:30").toISOString());

  console.log(parseDate("2019-10-01T03:00:00.000+03").toISOString());
  console.log(parseDate("2019-09-30T21:00:00.000-03").toISOString());

  console.log(parseDate("2019-10-01T10:00:00.000+10").toISOString());
  console.log(parseDate("2019-09-30T14:00:00.000-10").toISOString());

  // also handles space instead of T
  console.log(parseDate("2019-09-30 19:00:00").toISOString());
  console.log(parseDate("2019-09-30 19:00").toISOString());
  console.log(parseDate("2019-10-01 00:00:00.000Z").toISOString());
  console.log(parseDate("2019-09-30 23:00:00.000-01:00").toISOString());
  console.log(parseDate("2019-09-30 18:00:00.000-06:").toISOString());
  console.log(parseDate("2019-09-30 18:00:00-06:").toISOString());

  console.log();
  console.log(parseDate("10-OCT-18"));
  console.log(typeof parseDate("03-MAY-25"));
  console.log(typeof parseDate("2019-09-30T14:00:00"));

}

test();
