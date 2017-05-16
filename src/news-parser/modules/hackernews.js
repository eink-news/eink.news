var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'
import https from 'https'
import getHNComments from '../../helpers/parsing/get-HN-comments'

const hackernewsParser = function(epub){
  return new Promise(function(resolve) {
    //Variables declaration: response array, Regex to get all the articles, Regex to get all article links, and a cleaning sentence to delete some unnecessary links from the ebook
    var final_response = []

    const regex_articles = /<td align="right" valign="top" class="title"><span class="rank"([\s\S]*?)<tr class="spacer" style="height:5px"><\/tr>/g
    const articles = epub.match(regex_articles);

    const regex_url_article = /<a href="(.*)" class="storylink"(?: rel="nofollow")?>/g
    const articlesUrl = getMatches(articles.join(), regex_url_article, articles.length)
    console.log(articlesUrl);

    const regex_article_id = /<\/span> \| <a href="hide\?id=(.*?)&amp;goto=news">(?:[0-9]*&nbsp;comments|discuss|hide)<\/a>/g
    const articlesId = getMatches(articles.join(), regex_article_id, articles.length, 1)

    const regex_article_titles = /class="storylink"[ a-zA-Z=".]*>(.*?)<\/a><span/g
    const articlesTitles = getMatches(epub, regex_article_titles, articles.length)

    Promise.mapSeries(articles, (function(a, index) {
      return new Promise(function(resolve){
        // if its a normal article (we know it because it has //, HN links like askHN or hiring are relative urls)
        const articleUrl = articlesUrl[index]
        const isNormalUrlRegex = /\/\//g
        if (isNormalUrlRegex.test(articleUrl)) {
          console.log('reading content from website!');
          const url = articlesUrl[index]
          // for testing purposes and going faster, uncomment next line to skip reading the website
          // resolve({page: 'Development mode, not reading.', index:index})
          read(url, function(err, page){
            page ? resolve({page:page.content, index:index}) : resolve(null)
          })
        } else { // if the link is to hackernews
          console.log('its not a normal article. Might be an askHN or a Hiring');
          // const url = `https://news.ycombinator.com/item?id=${articlesId[index]}`
          // follow the url and get the question if there is so
          // const question = 'Parse as askHN or hiring!'
          resolve({page: question, index:index})
        }
      })
    }))
      .then(function(articlesParsed){
        Promise.mapSeries(articlesParsed, (function(articleP) {
          console.log("Articles content gotten. Getting comments...");
          return new Promise(function(resolve){
            if(articleP == null){
              resolve(false)
            }
            else if (articleP.page != false){
              // We should only get the comments if the article isnt an askHN or hiring
              const isNormalUrlRegex = /\/\//g
              if (isNormalUrlRegex.test(articlesUrl[articleP.index])) {
                const commentsUrl = 'https://news.ycombinator.com/item?id='+articlesId[articleP.index]
                https.get(commentsUrl, (res) => {
                  var data = []
                  res.on('data', (d) => {
                    data.push(d)
                  }).on('end', function() {
                    const commentsHtml = Buffer.concat(data).toString()
                    getHNComments(commentsHtml).then((parsedComments)=> {
                      // add n of comments to the title of the article
                      const articleTitle = '(' + parsedComments.nComments + ') ' + articlesTitles[articleP.index]
                      const articleCommentsTitle = 'Comments'
                      // add the article itself to the ebook
                      final_response.push({title: articleTitle, data: articleP.page})
                      // add the comments to the ebook
                      final_response.push({title: articleCommentsTitle, data: parsedComments.content})
                      console.log('Added article content and Comments to ebook!');
                      resolve(true)
                    })
                  }).on('error', (e) => {
                    console.error("There's been an error getting the html content for this url: ", url);
                    console.error(e)
                    resolve(false)
                  })
                })
              } else {
                // Its askHN or hiring, so parse only comments as the article content
                const url = `https://news.ycombinator.com/item?id=${articlesId[articleP.index]}`
                https.get(url, (res) => {
                  var data = []
                  res.on('data', (d) => {
                    data.push(d)
                  }).on('end', function() {
                    const commentsHtml = Buffer.concat(data).toString()
                    const articleSubtitleRegex = /<tr style="height:2px"><\/tr><tr><td colspan="2"><\/td><td>([.\s\S]*)<\/td><\/tr>[\s\S]*<tr style="height:10px"><\/tr><tr><td colspan="2"><\/td><td>/g
                    const articleSubtitle = getMatches(articleContent, articleSubtitleRegex, 1)
                    getHNComments(commentsHtml).then((parsedComments)=> {
                      // add n of comments to the title of the article
                      const articleTitle = '(' + parsedComments.nComments + ') ' + articlesTitles[articleP.index]
                      // add the article itself to the ebook with a subtitle if it has one
                      const content = articleSubtitle ? '<b>'+articleSubtitle+'</b></br>'+parsedComments.content : parsedComments.content
                      final_response.push({title: articleTitle, data: content})
                      resolve(true)
                    }).catch((err)=>{
                      // no ha pogut parsejar els comentaris
                      console.log('Problem with:');
                      console.log('--> ', url);
                      console.log(commentsHtml);
                      resolve()
                    })
                  }).on('error', (e) => {
                    console.error("There's been an error getting the html content for this url: ", url);
                    console.log('It seems its a hiring article. Confirm with the following output:');
                    console.error(e)
                    resolve(false)
                  })
                })

              }
            } else {
              console.log('Ups! Something happended and we coudnt parse the content nor comments');
              resolve(false)
            }
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
