/**
 * storage/test/lib/init.js
 */

var auth = require("../../storage/authentication");

if (process.env.NODE_ENV === "development") {
  auth.load("./test/auth_entries.json");
}
