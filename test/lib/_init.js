/**
 * storage/test/lib/init.js
 */

var authStash = require("../../storage/auth-stash");

if (process.env.NODE_ENV === "development") {
  authStash.load("./test/auth_stash.json");
}
