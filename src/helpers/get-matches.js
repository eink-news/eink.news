const getMatches = function(string, regex, length, index = 1, callback) {
  // console.log(callback.type);
  console.log("getMatches");
  var matches = [];
  var match;
  for(var i = 0; i<length; i++) {
    match = regex.exec(string)
    if(match != null){
      matches.push(match[index]);
    }else{matches.push(null)}
  }
  if(callback == undefined){
    return matches
  }
  else{
    callback(matches)
  }
}

export default getMatches;
