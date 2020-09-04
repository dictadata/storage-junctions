/**
 * test/csv
 */
"use strict";

const storage = require("../../lib/index");
const EchoJunction = require("../../lib/echo");
const logger = require('../../lib/logger');
const fs = require('fs');

logger.info("=== Tests: echo encodings");

async function tests() {

  var jo;
  var encoding;
  try {
    logger.info(">>> adding EchoJunction to storage cortex");
    storage.use("echo", EchoJunction);

    logger.verbose('=== read foo_encoding full');
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/foo_encoding.json", "utf8"));
    await jo.putEncoding(encoding);
    encoding = await jo.getEncoding();
    logger.verbose(JSON.stringify(encoding,null,2));
    fs.writeFileSync("./test/output/foo_encoding_full.json",JSON.stringify(encoding,null,2), "utf8");

    logger.verbose('=== read foo_encoding short');
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/foo_encoding_short.json", "utf8"));
    await jo.putEncoding(encoding);
    encoding = await jo.getEncoding();
    logger.verbose(JSON.stringify(encoding,null,2));
    fs.writeFileSync("./test/output/foo_encoding_short.json",JSON.stringify(encoding,null,2), "utf8");

    logger.verbose('=== read foo_encoding typesonly');
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/foo_encoding_typesonly.json", "utf8"));
    await jo.putEncoding(encoding);
    encoding = await jo.getEncoding();
    logger.verbose(JSON.stringify(encoding,null,2));
    fs.writeFileSync("./test/output/foo_encoding_typesonly.json",JSON.stringify(encoding,null,2), "utf8");
  }
  catch (err) {
    logger.error(err);
  }
  finally {
    if (jo) jo.relax();
  }
}

tests();
