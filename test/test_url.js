#!/usr/bin/env node

let Url;
try {
  Url = new URL("/data/test", "http://dev.dictadata.org/");
} catch (error) {
  console.log(error.message);
}
