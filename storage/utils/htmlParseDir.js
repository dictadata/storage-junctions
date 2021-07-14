// storage/utils/htmlParseDir
"use strict";

/////// parse HTML directory page

/**
 * Parse directory entries from an HTML snippet
 * @param {*} response full HTTP response 
 * @param {*} html rawText of the inner HTML content to process for directory entries
 * @returns an array of directory entries
 */
module.exports = exports = function (serverType, html, direxp) {
  
  if (!direxp) {

    if (serverType.indexOf("IIS") >= 0)
      //direxp = /(?<date>.*AM|PM) +(?<size>[0-9]+|<dir>) <A HREF="(?<href>.*)">(?<name>.*)<\/A>/;
      direxp = /(?<date>.*AM |.*PM ) +(?<size>[0-9]+|<dir>) <a href="(?<href>.*)">(?<name>.*)<\/a>/i;
    else if (serverType.indexOf("nginx") >= 0)
      direxp = /<a href="(?<href>.*)">(?<name>.*)<\/a> +(?<date>[0-z,\-]+ [0-9,:]+) +(?<size>.*)/;

  }

  html = decodeURI(html);
  var lines = html.split(/(?:<br>|\n|\r)+/);
  var entries = [];

  for (var i = 0; i < lines.length; i++) {
    var line = decodeEntities(lines[i]);

    var m = direxp.exec(line);
    if (m && m.length === 5) {
      let d = m.groups;
      var isDir = Number.isNaN(Number.parseInt(d['size']));

      var direntry = {
        href: d['href'],
        name: d['name'],
        isDir: isDir,
        date: new Date(d['date']),
        size: isDir ? 0 : parseInt(d['size'])
      };

      entries.push(direntry);
    }
  }

  return entries;
}

/**
 * decode HTML text entities that may be in the directory entry string
 * @param {*} encodedString 
 * @returns 
 */
function decodeEntities(encodedString) {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
    "nbsp": " ",
    "amp": "&",
    "quot": "\"",
    "lt": "<",
    "gt": ">"
  };

  return encodedString.replace(translate_re, function (match, entity) {
    return translate[entity];
  }).replace(/&#(\d+);/gi, function (match, numStr) {
    var num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
}
