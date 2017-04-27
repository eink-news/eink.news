var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'


const hackernewsParser = function(epub){
  return new Promise(function(resolve) {
    //Variables declaration: response array, Regex to get all the articles, Regex to get all article links, and a cleaning sentence to delete some unnecessary links from the ebook
    var final_response = []
    const regex_articles = /<td align="right" valign="top" class="title"><span class="rank"([\s\S]*?)<tr class="spacer" style="height:5px"><\/tr>/g
    const regex_url_article = /<\/div><\/a><\/center><\/td><td class="title"><a href="(.*?)"/g
    const regex_url_article_comments = /\| <a href="(.*?)<\/a> \| <a href="(.*?)">[0-9]*&nbsp;comments<\/a>/g
    const regex_article_titles = /class="storylink"[ a-zA-Z=".]*>(.*?)<\/a><span/g
    const articles = epub.match(regex_articles);
    const articlesUrl = getMatches(articles.join(), regex_url_article, articles.length)
    const articlesUrlComments = getMatches(articles.join(), regex_url_article_comments, articles.length, 2)
    const articlesTitles = getMatches(epub, regex_article_titles, articles.length)
    //TODO: No detecta todas las noticias correctamente
    // creation of a loop which gets the content and title of every article.
    // First of all: Promise.all in order to wait for all articles to finish being parsed , then the url articles array is mapped and each article becomes a Promise
    // When each promise has finished a new content and title is pushed into the final array
    var i = -1;
    Promise.mapSeries(articles, (function() {
      i = i + 1;
      console.log(i);
      return new Promise(function(resolve){
        if(articlesUrl[i] != null){
          let url = articlesUrl[i];
          url.split('//') ? '' : url=`https://news.ycombinator.com/${url}`
          read(url, function(err, page){
            page ? resolve({page:page.content, index:i}) : resolve(null)
          })
        }
        else resolve(null)
      })
    }),{concurrency: 2})
      .then(function(articlesParsed){
        Promise.mapSeries(articlesParsed, (function(articleP) {
          console.log("crash");
          return new Promise(function(resolve){
            if(articleP == null){ resolve(false)}
            else if(articleP.page != false & articlesUrlComments[articleP.index] != null){
                read('https://news.ycombinator.com/'+articlesUrlComments[articleP.index], function(err, page){
                  console.log('insidetheread');
                  final_response.push({ title: articlesTitles[articleP.index], data: articleP.page})
                  page.content ? final_response.push({ title: 'Comments:'+articlesTitles[articleP.index], data:page.content}) : ''
                  console.log("crashasdf");
                  resolve(true)
                })
              }
            else{resolve(false)}
          })
        }),{concurrency: 2})
        .then(function() {
          console.log('sefini');
          // console.log(final_response);
          resolve(final_response)
        })
      })
  })
}

export default hackernewsParser
