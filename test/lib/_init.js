/**
 * storage/test/lib/init.js
 */

var auth = require("../../storage/auth");

if (process.env.NODE_ENV === "development") {
  auth.load("./test/auth_entries.json");
}
