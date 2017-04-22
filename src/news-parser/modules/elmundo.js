var read = require('node-readability');
import Promise from 'bluebird'

const elmundoParser = function(epub){
  return new Promise(function(resolve) {
    //Variables declaration: response array, Regex to get all the articles, Regex to get all article links, and a cleaning sentence to delete some unnecessary links from the ebook
    var final_response = []
    const regex_articles= /(<h3 class="mod-title[-.?+%$A-Za-z0-9... ]*" itemprop="headline"><a href="(.*?).html"|<h3 class="flex-article__heading"><a href="(.*?).html" class="flex-article__heading-link)/g
    const regex_url=/http:\/\/(.*?).html/g
    const cleaning = '<li><a onclick="eventoSCModu'
    // articles and url articles, all detected by the usage of regex.
    const articles = epub.match(regex_articles);
    const articlesUrl = articles.join().match(regex_url)
    // creation of a loop which gets the content and title of every article.
    // First of all: Promise.all in order to wait for all articles to finish being parsed , then the url articles array is mapped and each article becomes a Promise
    // When each promise has finished a new content and title is pushed into the final array
    Promise.all(articlesUrl.map(function(url) {
      return new Promise(function(resolve){
        read(url, function(err, article){
          resolve(article)
        })})
        .then(function(article){
          final_response.push({ title: article.title, data: article.content.split(cleaning)[0]})
        })
    }))
      .then(function() {
        resolve(final_response)
      })
      .catch(function(err) {
        console.log(err);
      });
  });
}

export default elmundoParser
