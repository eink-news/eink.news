var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'

const hackernewsParser = function(epub){
  return new Promise(function(resolve) {
    //Variables declaration: response array, Regex to get all the articles, Regex to get all article links, and a cleaning sentence to delete some unnecessary links from the ebook
    var final_response = []

    const regex_articles = /<td align="right" valign="top" class="title"><span class="rank"([\s\S]*?)<tr class="spacer" style="height:5px"><\/tr>/g
    const articles = epub.match(regex_articles);

    const regex_url_article = /<a href="(.*)" class="storylink"(?: rel="nofollow")?>/g
    const articlesUrl = getMatches(articles.join(), regex_url_article, articles.length)

    const regex_article_id = /<\/span> \| <a href="hide\?id=(.*?)&amp;goto=news">(?:[0-9]*&nbsp;comments|discuss|hide)<\/a>/g
    const articlesId = getMatches(articles.join(), regex_article_id, articles.length, 1)

    const regex_article_titles = /class="storylink"[ a-zA-Z=".]*>(.*?)<\/a><span/g
    const articlesTitles = getMatches(epub, regex_article_titles, articles.length)

    Promise.mapSeries(articles, (function(a, index) {
      return new Promise(function(resolve){
        // if its a normal article
        if (articlesUrl[index].test(/\/\//g)) {
          console.log('reading content from website!');
          const url = articlesUrl[index]
          read(url, function(err, page){
            page ? resolve({page:page.content, index:index}) : resolve(null)
          })
        } else { // if the link is to hackernews
          console.log('its not a normal article. Might be an askHN or a Hiring');
          const url = `https://news.ycombinator.com/item?id=${articlesId[index]}`
          // follow the url and get the question if there is so
          const question = ''
          resolve({page: question, index:index})
        }
      })
    }))
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
