#!/usr/bin/env node

let Url;
try {
  Url = new URL("/data/test", "http://dev.dictadata.net/");
} catch (error) {
  console.log(error.message);
}
