#!/usr/bin/env node

function templateReplace (template, source) {
  const templateMatcher = /\$\{\s?([^{}\s]*)\s?\}/g;
  let text = template.replace(templateMatcher, (matched, p1) => {
    if (hasOwnProperty.prototype.hasOwnProperty(source,p1))
      return source[p1];
    else
      return matched;
  });
  return text;
}

console.log(templateReplace("some ${thing} else ${entirely}", {thing: "one", entirely: "right"}));
