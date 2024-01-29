/**
 * storage/codex
 *
 * Codex is a data directory and dictionary of encoding definitions.
 *
 * codex types:
 *   engram - SMT encoding definitions
 *   tract  - ETL tract definitions
 *   auth   -
 *
 **/
"use strict";

const { StorageError } = require("../types");
const Engrams = require("./engrams");
const Tracts = require("./tracts");
const auth_stash = require("./auth");

class Codex {

  static async activate(type, smt) {

    if (type === "engram") {
      if (Codex.engrams) {
        await Codex.engrams.relax();
        Codex.engrams = null;
      }
      Codex.engrams = new Engrams(smt);
      await Codex.engrams.activate();
      return Codex.engrams;
    }
    else if (type === "tract") {
      if (Codex.tracts) {
        Codex.tracts.relax();
        Codex.tracts = null;
      }
      Codex.tracts = new Tracts(smt);
      await Codex.tracts.activate();
      return Codex.tracts;
    }
    else {
      throw new StorageError(400, "invalid codex type");
    }

  }

}

Codex.engrams = null;
Codex.tracts = null;
Codex.auth = auth_stash;

Codex.Engrams = Engrams;
Codex.Tracts = Tracts;

module.exports = exports = Codex;
