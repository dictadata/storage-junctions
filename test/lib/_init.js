/**
 * storage/test/lib/init.js
 */

var auth_stash = require("../../storage/auth-stash");

if (process.env.NODE_ENV === "development") {
  auth_stash.load("./test/lib/auth.json");
}
