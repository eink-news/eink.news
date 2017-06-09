var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'
import https from 'https'
import getHNComments from '../../helpers/parsing/get-HN-comments'

const askhackernews = function(epub){
  return new Promise(function(resolve) {
    var final_response = []
    const articlesRegex =/(<a href="item\?id=[0-9]*" class="storylink">)/g
    const articles = epub.match(articlesRegex)

    const urlRegex = /href="(item\?id=[0-9]*)"/g
    getMatches(articles.join(), urlRegex, articles.length, 1,(urls) => {
      urls = urls.map((url) => "https://news.ycombinator.com/"+url)
      console.log('crash');
      console.log(urls);
      const titleRegex = /<a href="item\?id=[0-9]*" class="storylink">(.*?)<\/a>/g
      getMatches(epub, titleRegex, urls.length, 1, (titles) => {
        Promise.mapSeries(urls, (function(a, index) {
          console.log("mapSeries");
          return new Promise(function(resolve){
            // we get the html content of each url
            https.get(urls[index], (res) => {
              var data = []
              res.on('data', (d) => {
                data.push(d)
              }).on('end', function() {
                console.log("end");
                  const articleContent = Buffer.concat(data).toString()
                  const articleSubtitleRegex = /<tr style="height:2px"><\/tr><tr><td colspan="2"><\/td><td>([.\s\S]*)<\/td><\/tr>[\s\S]*<tr style="height:10px"><\/tr><tr><td colspan="2"><\/td><td>/g
                  getMatches(articleContent, articleSubtitleRegex, 1, 1, (articleSubtitle) => {
                    console.log("articleSubtitle");
                    getHNComments(articleContent)
                    .then((commentsContent) => {
                      const headerWithComments = "(" + commentsContent.nComments + ") " + titles[index].replace('Ask HN: ', '')
                      // if the article has subtitle, add it to the parsedArticle, otherwise leave it
                      const parsedArticle = articleSubtitle ? '<b>'+articleSubtitle+'</b></br>'+commentsContent.content : commentsContent.content
                      final_response.push({title: headerWithComments, data: parsedArticle})
                      setTimeout(() => {
                        resolve(true), 1000
                      })
                    })
                  })
              })
            }).on('error', (e) => {
              console.error("There's been an error getting the html content for this url: ", urls[index]);
              console.error(e)
              resolve(false)
            })
          }) // end of returning promise
        }))
          .then(() => {
            console.log("finished processing, resolving final_response...");
            resolve(final_response)
          })
      })
    })
  })
}

export default askhackernews
