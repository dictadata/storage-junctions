

function replace (template, source) {
  const templateMatcher = /\$\{\s?([^{}\s]*)\s?\}/g;
  let text = template.replace(templateMatcher, (matched, p1) => {
    if (Object.hasOwn(source,p1))
      return source[p1];
    else
      return matched;
  });
  return text;
}

console.log(replace("some ${thing} else ${entirely}", {thing: "one", entirely: "right"}));
