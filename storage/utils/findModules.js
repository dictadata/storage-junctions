/**
 * storage/utils/findModules.js
 */
const { access, constants } = require("node:fs/promises");
const { parse, join } = require("node:path");
const { cwd } = require("node:process");

/**
 * @param {String} dir - fully qualified directory path, e.g. ___dirname
 */
module.exports = exports = async (dir) => {
  if (!dir)
    dir = cwd();

  let found = false;
  let dp = parse(dir);

  while (!found && dir !== dp.root) {
    // Check if node_modules is readable.
    try {
      let nm = join(dir, "node_modules");
      await access(nm, constants.R_OK);
      found = true;
    }
    catch {
      dir = dp.dir;
      dp = parse(dir);
    }
  }

  return found ? join(dir, "/node_modules") : "";
};
