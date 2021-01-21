/**
 * test/csv
 */
"use strict";

const storage = require("../../lib/index");
const EchoJunction = require("../../lib/echo-junction");
const logger = require('../../lib/logger');
const fs = require('fs');

logger.info("=== Tests: echo encodings");

async function tests() {

  var jo;
  var encoding;
  try {
    logger.info(">>> adding EchoJunction to storage cortex");
    storage.use("echo", EchoJunction);

    logger.verbose('=== read encoding_foo.json');
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/encoding_foo.json", "utf8"));
    await jo.putEncoding(encoding);
    encoding = await jo.getEncoding();
    logger.verbose(">> encoding_foo_full.json")
    logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./test/output/encoding_foo_full.json", JSON.stringify(encoding, null, 2), "utf8");

    logger.verbose('=== read encoding_foo_short.json');
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/encoding_foo_short.json", "utf8"));
    await jo.putEncoding(encoding);
    encoding = await jo.getEncoding();
    logger.verbose(">> encoding_foo_short.json");
    logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./test/output/encoding_foo_short.json", JSON.stringify(encoding, null, 2), "utf8");

    logger.verbose('=== read encoding_foo_typesonly');
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/encoding_foo_typesonly.json", "utf8"));
    await jo.putEncoding(encoding);
    encoding = await jo.getEncoding();
    logger.verbose(">> encoding_foo_typesonly.json");
    logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./test/output/encoding_foo_typesonly.json", JSON.stringify(encoding, null, 2), "utf8");
  }
  catch (err) {
    logger.error(err);
  }
  finally {
    if (jo) jo.relax();
  }
}

tests();
