/**
 * storage/test/lib/init.js
 */

var codex_auth = require("../../storage/codex-auth");

if (process.env.NODE_ENV === "development") {
  codex_auth.load("./test/lib/auth.json");
}
