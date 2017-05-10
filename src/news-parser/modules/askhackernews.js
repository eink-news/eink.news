var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'
import https from 'https'
import getHNComments from '../../helpers/parsing/get-HN-comments'

const askhackernews = function(epub){
  return new Promise(function(resolve) {
    // console.log("foo");
    var final_response = []

    const articlesRegex =/(<a href="item\?id=[0-9]*" class="storylink">)/g
    const articles = epub.match(articlesRegex)
    // console.log('articles = ', articles);

    const urlRegex = /href="(item\?id=[0-9]*)"/g
    const urls = getMatches(articles.join(), urlRegex, articles.length, 1).map((url) => "https://news.ycombinator.com/"+url)
    // console.log("number of urls: ", urls.length);
    // console.log('urls = ', urls);

    const titleRegex = /<a href="item\?id=[0-9]*" class="storylink">(.*?)<\/a>/g
    const titles = getMatches(epub, titleRegex, urls.length, 1)

    Promise.mapSeries(urls, (function(a, index) {
      return new Promise(function(resolve){
        // we get the html content of each url
        https.get(urls[index], (res) => {
          var data = []
          res.on('data', (d) => {
            data.push(d)
          }).on('end', function() {
              const articleContent = Buffer.concat(data).toString()
              console.log(articleContent);
              // getHNComments(articleContent).then((commentsContent) => {
              //   const headerWithComments = "(" + commentsContent.nComments + ") " + titles[index].replace('Ask HN: ', '')
              //   final_response.push({title: headerWithComments, data: commentsContent.content})
              //   resolve(true)
              // })
              getHNComments(articleContent).then((commentsContent) => {
                const headerWithComments = "(" + commentsContent.nComments + ") " + titles[index].replace('Ask HN: ', '')
                final_response.push({title: headerWithComments, data: commentsContent.content})
                resolve(true)
              })
          })
        }).on('error', (e) => {
          console.error("There's been an error getting the html content for this url: ", urls[index]);
          console.error(e)
          resolve(false)
        })

        // read(urls[index], function(err, page){
        //   if (!err) {
        //
        //     final_response.push({title: header, data: page.content })
        //     resolve(true) // com t'assegures que s'ha acabat el push abans de fer resolve?
        //   } else {
        //     console.log("there's been an error using read on this url: ", urls[index]);
        //     console.log(err);
        //     resolve(null) // should be reject
        //   }
        // })

      }) // end of returning promise
    }))
      .then(() => {
        console.log("finished processing, resolving final_response...");
        resolve(final_response)
      })
  })

}

export default askhackernews
