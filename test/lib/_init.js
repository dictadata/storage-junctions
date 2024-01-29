/**
 * storage/test/lib/init.js
 */

var Codex = require("../../storage/codex");

if (process.env.NODE_ENV === "development") {
  Codex.auth.load("./test/auth_stash.json");
}
