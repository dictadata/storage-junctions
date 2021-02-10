let { isDate } = require('../lib/types');

function test () {
  console.log(isDate("2019-10-01"));

  console.log(isDate("2019-09-30T19:00:00"));
  console.log(isDate("2019-10-01T00:00:00Z"));

  console.log(isDate("2019-09-30T19:00:00.555"));
  console.log(isDate("2019-10-01T00:00:00.555Z"));

  console.log(isDate("2019-10-01T05:00:00.000+05:00"));
  console.log(isDate("2019-09-30T19:00:00.000-05:00"));

  console.log(isDate("2019-10-01T04:15:00.000+04:15"));
  console.log(isDate("2019-09-30T19:30:00.000-04:30"));

  console.log(isDate("2019-10-01T03:00:00.000+03"));
  console.log(isDate("2019-09-30T21:00:00.000-03"));

  console.log(isDate("2019-10-01T10:00:00.000+10"));
  console.log(isDate("2019-09-30T14:00:00.000-10"));

  // also handles space instead of T
  console.log(isDate("2019-09-30 19:00:00"));
  console.log(isDate("2019-09-30 19:00"));
  console.log(isDate("2019-10-01 00:00:00.000Z"));
  console.log(isDate("2019-09-30 23:00:00.000-01:00"));
  console.log(isDate("2019-09-30 18:00:00.000-06:"));
  console.log(isDate("2019-09-30 18:00:00-06:"));
  console.log(isDate("2019-10-01 06:00:00+06:"));

  console.log();
  console.log(isDate("01/18/1961"));

  console.log();
  console.log(isDate("03-MAY-25"));
  let d1 = new Date("03-MAY-25");
  console.log(d1.toISOString());
  console.log(isDate("03-MAY-25 13:05:17"));
  let d2 = new Date("03-MAY-25 13:05:17");
  console.log(d2.toISOString());
  let d3 = new Date("03-MAY-1925 13:05:17");
  console.log(d3.toISOString());
}

test();
