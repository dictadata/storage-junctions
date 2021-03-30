#!/usr/bin/env node

let Url;
try {
  Url = new URL("/data/test", "http://localhost/");
} catch (error) {
  console.log(error.message);
}
