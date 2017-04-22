var fs = require('fs')
var scrape = require("website-scraper")
import Promise from 'bluebird'

import deleteFolderRecursive from '../../helpers/delete-folder-recursive'
// creatoin of the module
const nytimesParser = function(epub){
// creation of the Promise the module will export
  return new Promise(function(resolve, reject) {
// creation of all the regex expression needed to create the epub. One expression to detect every article in the page, one to detect every link in the article, ...
    const regex_article = /<h2 class="story-heading"[^>]*>((?:.|\r?\n)*?)<\/h2>/g
    const regex_url = /<a href="(.*?).html"/
    const regex_title = /.html">(.*?)<\/a>/
    const regex_final = /<p class="story-body-text story-content(.*?)<\/p>/g

    // array containing all the articles of this module
    const articles = epub.match(regex_article)
    var articleUrl = []
    var articleTitle = []
    var final_response = []
    var counter = 0
    var html_article = ''
    // TODO: Mirar si se puede eliminar la declaracion de html_article
    // for loop which creates define articleUrl and articleTitle values. It goes article by article, till it finishes de article array
    // TODO: Make all this for synchronous.
    for (var i = 0; i < articles.length;  i++) {
      if (regex_url.exec(articles[i]) !== null && regex_title.exec(articles[i]) !== null) {
          // define the articleUrl by using the regex expression and concatinating the end of the url
          articleUrl[counter] = regex_url.exec(articles[i])[1].toString().concat('.html')
          // define articleTitle by using regex expressoin and then replacing every newline with a void
          articleTitle[counter] = regex_title.exec(articles[i])[1].replace('\n','')
          // Updating the index of articleUrl and articleTitle arrays
          counter++
        }
    }

    // TODO: Te algun sentit fer-ho així? guardar, llegir, borrar? No és millor directament fer una request i llegir el body?
    const articlePromises = articleTitle.map((article, i) => {
      // Scrape an article URL and gets its html, then save it in folder ./file/* it's a promise
      return scrape({
        urls: [articleUrl[i]],
        directory: `./file/file${i}.html`,
        recursive: false,
        maxDepth: 1
      })
        //once the articles' htmls have been parsed we process them. First we read all html one by one, then we parse throught them using a regex expresion. finally we concatenate all of them.
        .then(function(){
          html_article = fs.readFileSync(`./file/file${i}.html/index.html`,{ encoding: 'utf8' }).toString()
          const p_article = html_article.match(regex_final)
          const p_article_final = p_article ? p_article.join('') : ''
          final_response.push({ title: article, data: p_article_final })
        })
        .catch(function (err) {
          return reject(err)
        })
    })
    // deleteFolderRecursive deletes the folder which contains the articles, its located here because it deletes ALL the files only when they are ALL processed. Map is synchronous.
    deleteFolderRecursive('./file')
    Promise.all(articlePromises).then(() => resolve(final_response))
  })
}


export default nytimesParser
