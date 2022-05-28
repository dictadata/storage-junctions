/**
 * test/http/copy
 */
"use strict";

const getFiles = require('../lib/_getFiles');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: http file downloads");

async function downloads_IIS() {

  logger.info("=== IIS download foo files");
  if (await getFiles({
    origin: {
      smt: "*|http://localhost/data/dictadata.org/test/input/|foofile*.json|*",
    },
    terminal: {
      smt: "*|./data/output/http/IIS/|*|*",
    }
  })) return 1;

  logger.info("=== IIS download encoding files");
  if (await getFiles({
    origin: {
      smt: "*|http://localhost/data/dictadata.org/test/input/|*.encoding.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|./data/output/http/IIS/|*|*",
      options: {
        use_rpath: true
      }
    }
  })) return 1;

}

async function downloads_NGINX() {

  logger.info("=== NGINX download foo files");
  if (await getFiles({
    origin: {
      smt: "*|https://api.dictadata.org/data/dictadata.org/test/input/|foofile*.json|*",
    },
    terminal: {
      smt: "*|./data/output/http/NGINX/|*|*",
    }
  })) return 1;

  logger.info("=== NGINX download encoding files");
  if (await getFiles({
    origin: {
      smt: "*|https://api.dictadata.org/data/dictadata.org/test/input/|*.encoding.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|./data/output/http/NGINX/|*|*",
      options: {
        use_rpath: true
      }
    }
  })) return 1;

}

(async () => {
  if (await downloads_IIS()) return;
  if (await downloads_NGINX()) return;
})();
