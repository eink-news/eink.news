const getMatches = function(string, regex, length, index = 1) {
  var matches = [];
  var match;
  for(var i = 0; i<length; i++) {
    match = regex.exec(string)
    if(match != null){
      matches.push(match[index]);
    }else{matches.push(null)}
  }
  return matches;
}

export default getMatches;
