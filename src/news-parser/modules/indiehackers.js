var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'
//const getMatches = function(string, regex, length, index = 1)
const indiehackersParser = function(epub){
  return new Promise(function(resolve) {
    console.log("crash");
    //Variables declaration: response array, Regex to get all the articles, Regex to get all article links, and a cleaning sentence to delete some unnecessary links from the ebook
    var final_response = []
    const regex_articles = /<li data-business-id=[\s\S]*? id="ember[0-9]*"/g
    const regex_url= /<a href="\/businesses\/(.*?)" id="ember[0-9]*" class="interview-link__link ember-view">/g
    const regex_title = /<p class="interview-link__name">(.*?)<\/p>/g
    const regex_description = /<p class="interview-link__subtitle">(.*?)<\/p>/g
    const regex_revenue = /<div id="ember[0-9]*" class="business-revenue ember-view">[ <!---->]*[> ]([\s\S]*?)<\/div>\s*?/g

    // articles and url articles, all detected by the usage of regex.
    const articles = epub.match(regex_articles)

    if(articles){

      const urls = getMatches(epub, regex_url, articles.length, 1)
      const title = getMatches(epub, regex_title, articles.length, 2)
      const description = getMatches(epub, regex_description, articles.length, 3)
      const revenue = getMatches(epub, regex_revenue, articles.length, 4)
      console.log(urls);
      console.log(title);
      console.log(description);
      console.log(revenue);
      console.log(articles.length);
      console.log(urls.length);
      console.log(description.length);
      console.log(revenue.length);

      // const author = getMatches(epub, regex, articles.length, 5)

      if (urls != null & title != null & description!= null & revenue!= null){
        Promise.mapSeries(articles, (function(a, index) {
          return new Promise(function(resolve){
            if(urls[index-1] != null & title[index-1]!= null & description[index-1]!= null & revenue[index-1]!= null ){
              read(`https://www.indiehackers.com/businesses/${urls[index-1]}`, function(err, page){
                  // console.log(page);
                  let header = title[index-1] + '; ' + description[index-1] + '; Revenue: ' +  revenue[index-1];
                  page ? final_response.push({ title: header , data: page.content }) & resolve(true) : resolve(null)
              })
            }
            else resolve(null)
          })
        }))
        .then(function(){resolve(final_response)})
      }
    }
    else{
      resolve(null)
    }
  })
}

export default indiehackersParser
