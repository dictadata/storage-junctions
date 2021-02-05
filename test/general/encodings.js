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
    logger.verbose(">>> encoding_foo_full.json")
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/encoding_foo.json", "utf8"));
    await jo.putEncoding(encoding);
    logger.verbose("<<< encoding_foo_full.json")
    encoding = await jo.getEncoding();
    logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./output/encoding_foo_full.json", JSON.stringify(encoding, null, 2), "utf8");

    logger.verbose('=== read encoding_foo_types.json');
    logger.verbose(">>> encoding_foo_types.json");
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/encoding_foo_types.json", "utf8"));
    await jo.putEncoding(encoding);
    logger.verbose("<<< encoding_foo_types.json");
    encoding = await jo.getEncoding();
    logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./output/encoding_foo_types.json", JSON.stringify(encoding, null, 2), "utf8");

    logger.verbose('=== read encoding_foo_typesonly');
    logger.verbose(">>> encoding_foo_typesonly.json");
    jo = await storage.activate("echo|*|*|*");
    encoding = JSON.parse(fs.readFileSync("./test/data/encoding_foo_typesonly.json", "utf8"));
    await jo.putEncoding(encoding);
    logger.verbose("<<< encoding_foo_typesonly.json");
    encoding = await jo.getEncoding();
    logger.debug(JSON.stringify(encoding, null, 2));
    fs.writeFileSync("./output/encoding_foo_typesonly.json", JSON.stringify(encoding, null, 2), "utf8");
  }
  catch (err) {
    logger.error(err);
  }
  finally {
    if (jo) jo.relax();
  }
}

(async () => {
  await tests();
})();
