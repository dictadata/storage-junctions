/**
 * test/http/copy
 */
"use strict";

const getFiles = require('../lib/_getFiles');
const { logger } = require("@dictadata/lib");

logger.info("=== Tests: http file downloads");

async function downloads_IIS() {

  logger.info("=== IIS download foo files");
  if (await getFiles({
    origin: {
      smt: "*|http://dev.dictadata.net/dictadata/test/data/input/|foofile*.json|*",
    },
    terminal: {
      smt: "*|./test/data/output/http/IIS/|*|*",
    }
  })) return 1;

  logger.info("=== IIS download encoding files");
  if (await getFiles({
    origin: {
      smt: "*|http://dev.dictadata.net/dictadata/test/data/input/engrams/|*.engram.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|./test/data/output/http/IIS/|*|*",
      options: {
        use_rpath: true
      }
    }
  })) return 1;

}

async function downloads_SOS() {

  logger.info("=== download sos.iowa.gov pdf file");
  if (await getFiles({
    "origin": {
      "smt": "*|https://sos.iowa.gov/elections/pdf/VRStatsArchive/2022/|CongNov22.pdf|*",
      "options": {
        "recursive": false
      }
    },
    "terminal": {
      "smt": "*|file:./test/data/output/http/SOS/|*|*",
      "options": {
        "use_rpath": false
      }
    }
  })) return 1;

}

(async () => {
  //if (await downloads_IIS()) return;
  if (await downloads_SOS()) return;
})();
