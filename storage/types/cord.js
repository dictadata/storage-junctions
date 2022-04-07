/**
 * storage/types/Cord
 *
 * Cord is an Engram with additional Codex related properties.
 */
"use strict";

const Engram = require('./engram');

module.exports = exports = class Cord extends Engram {

  /**
   * Cord class
   * @param {encoding|SMT} encoding, Engram object, SMT object or SMT string
   */
  constructor(encoding) {
    super(encoding);

    // codex encoding properties
    this.name = encoding.name || this.smt.schema || "";
    this.type = encoding.type || "engram";
    this.description = encoding.description || "";
    this.tags = encoding.tags || [];
  }

};
