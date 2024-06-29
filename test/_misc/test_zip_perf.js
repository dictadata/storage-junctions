/**
 * test zip file stream read speed
 */
"use strict";

const StreamZip = require('node-stream-zip');
const readline = require('node:readline');

(async () => {
  let count = 0;
  let start = Date.now();
  let timer = Date.now();
  let lt;

  let zipfile = "/var/dictadata/NC/dl.ncsbe.gov/data/ncvoter_Statewide.zip";
  let filename = "ncvoter_Statewide.txt";

  let zip = new StreamZip.async({ file: zipfile });
  const zs = await zip.stream(filename);

  const rl = readline.createInterface({
    input: zs,
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    count++;
    if (count % 10000 === 0) {
      lt = timer;
      timer = Date.now();
      console.log(`${count} ${timer - lt}ms`);
    }
  });

  rl.on('close',
    () => {
      console.log(count + " in " + (Date.now() - start));
      zip.close();
    });

})();
