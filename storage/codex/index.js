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

  static use(type, smt, options) {

    if (type === "engram") {
      if (Codex.engrams?.isActive) {
        Codex.engrams.relax();
        Codex.engrams = null;
      }
      Codex.engrams = new Engrams(smt, options);
      return Codex.engrams;
    }
    else if (type === "tract") {
      if (Codex.tracts?.isActive) {
        Codex.tracts.relax();
        Codex.tracts = null;
      }
      Codex.tracts = new Tracts(smt, options);
      return Codex.tracts;
    }
    else {
      throw new StorageError(400, "invalid codex type");
    }

  }

  static async activate(type) {

    if (type === "engram") {
      if (!Codex.engrams.isActive)
        await Codex.engrams.activate();
      return Codex.engrams;
    }
    else if (type === "tract") {
      if (!Codex.tracts.isActive)
        await Codex.tracts.activate();
      return Codex.tracts;
    }
    else {
      throw new StorageError(400, "invalid codex type");
    }

  }

  static async relax(type) {

    if (type === "engram") {
      if (Codex.engrams.isActive)
        await Codex.engrams.relax();
    }
    else if (type === "tract") {
      if (!Codex.tracts.isActive)
        await Codex.tracts.relax();
    }
    else {
      throw new StorageError(400, "invalid codex type");
    }

  }

}

// static class members
Codex.engrams = null;
Codex.tracts = null;
Codex.auth = auth_stash;

Codex.Engrams = Engrams;
Codex.Tracts = Tracts;

module.exports = exports = Codex;
