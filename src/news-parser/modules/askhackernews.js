var read = require('node-readability');
import Promise from 'bluebird'
import getMatches from '../../helpers/get-matches.js'
import https from 'https'

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
        // titulo del articulo
        const header = titles[index].replace('Ask HN: ', '')

        // we get the html content of each url
        https.get(urls[index], (res) => {
          var data = []
          res.on('data', (d) => {
            data.push(d)
          }).on('end', function() {
              const articleContent = Buffer.concat(data).toString()

              // get the number of comments on this post
              // When a post doesnt have comments it has to change!
              const isNotCommentedRegex = />discuss<\/a>/g
              let nComments = 0;
              // make sure there is comments
              if (!isNotCommentedRegex.test(articleContent)) { // if there is comments
                // console.log(nCommentsString);
                nComments = parseInt(articleContent.match(/([0-9]*)&nbsp;comment(?:s)?/g)[0])
              }

              // console.log("nComments= ", nComments);

              // get an array of usernames of each comment
              const usernameRegex = /<span class="comhead">[\s\S]*?<a.*?"hnuser">(.*?)<\/a>/g
              const usernames = getMatches(articleContent, usernameRegex, nComments, 1)
              // console.log("nUsernames= ", usernames.length);

              // get an array of dates for each comment
              // const commentsAgeRegex = /"age"><a href="item\?id=[\d]*">(.*?)<\/a>/g
              // let commentsAge = getMatches(articleContent, commentsAgeRegex, nComments+1, 1);
              // delete the first one because it's the age of the post
              // commentsAge.shift();

              // regex to get the comments content
              const commentsRegex = /<\/span><\/div><br><div class="comment">[\s\S]*?<span class="[\w\d]*">([.\s\S]*?)<span>[\s\S]*?<\/span><div class='reply'>/g
              // console.log('commentsRegex defined');
              // console.log(articleContent);
              const comments = getMatches(articleContent, commentsRegex, nComments, 1)

              // console.log('comments found!');

              const commentsIndentationRegex = /<td class='ind'><img src="s\.gif" height="1" width="(\w\d*)"><\/td>/g
              const commentsIndentation = getMatches(articleContent, commentsIndentationRegex, nComments, 1)
              const newIndentations = commentsIndentation.map((indentation) => parseInt(indentation)/40)
              // console.log(newIndentations);
              // console.log('all information is ready to get the content!');

              let cleanedArticleContent = ""
              if (nComments > 1) {
                for (var i = 0; i < nComments; i++) {
                  // console.log('i= ', i);
                  cleanedArticleContent += `<div style="margin-left:${newIndentations[i]}em;"><p><b style="color: grey;">${usernames[i]}: &nbsp;</b>${comments[i]}</p></div>`
                  if (i==nComments-1) {
                    // console.log("pushing into final_response article number: ", index);
                    const headerWithComments = "(" + nComments + ") " + header
                    final_response.push({title: headerWithComments, data: cleanedArticleContent})
                    resolve(true)
                  }
                }
              } else {
                cleanedArticleContent += `<div><p><b>This article has no comments yet</b></p></div>`
                // console.log("pushing into final_response article number: ", index);
                const headerWithComments = "(" + nComments + ") " + header
                final_response.push({title: headerWithComments, data: cleanedArticleContent})
                resolve(true)
              }
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
