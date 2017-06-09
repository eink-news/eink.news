// The helper gets the html of the commetns section of an article from HN
// It returns an object with the number of comments of the article and the parsed html of these.

import Promise from 'bluebird'
import getMatches from '../get-matches.js'

const getHNComments = function(articleCommentsHtml){
  console.log("comentssss");
  return new Promise(function(resolve) {
    // regex to check if there is comments in the post
    const isNotCommentedRegex = />discuss<\/a>/g
    // initialize comments to 0 in case there is none
    let nComments = 0;
    // if there is comments, find how many
    if (articleCommentsHtml.match(/([0-9]*)&nbsp;comment(?:s)?/g)) {
        nComments = parseInt(articleCommentsHtml.match(/([0-9]*)&nbsp;comment(?:s)?/g)[0])
    }

    // get an array of usernames of each comment
    const usernameRegex = /<span class="comhead">[\s\S]*?<a.*?"hnuser">(.*?)<\/a>/g
    getMatches(articleCommentsHtml, usernameRegex, nComments, 1, (usernames) => {
      // get an array of comments content
      const commentsRegex = /<\/span><\/div><br><div class="comment">[\s\S]*?<span class="[\w\d]*">([.\s\S]*?)<span>[\s\S]*?<\/span><div class='reply'>/g
      getMatches(articleCommentsHtml, commentsRegex, nComments, 1,(comments) => {
        // get an array of indentations if each comment
        const commentsIndentationRegex = /<td class='ind'><img src="s\.gif" height="1" width="(\w\d*)"><\/td>/g
        getMatches(articleCommentsHtml, commentsIndentationRegex, nComments, 1, (commentsIndentation) => {
          const newIndentations = commentsIndentation.map((indentation) => parseInt(indentation)/40)
          // variable to store the parsed html of the comments
          let cleanedArticleContent = ""
          // if there is one or more comments, add them together and return the final html
          if (nComments >= 1) {
            for (var i = 0; i < nComments; i++) {
              cleanedArticleContent += `<div style="margin-left:${newIndentations[i]}em;"><p><b style="color: grey;">${usernames[i]}: &nbsp;</b>${comments[i]}</p></div>`
              if (i==nComments-1) {
                const commentsContent = {
                  nComments: nComments,
                  content: cleanedArticleContent
                }
                resolve(commentsContent)
              }
            }
          } else {
            // if there is no comments, tell it
            cleanedArticleContent += `<div><p><b>This article has no comments yet</b></p></div>`
            const commentsContent = {
              nComments: nComments,
              content: cleanedArticleContent
            }
            resolve(commentsContent)
          }
        })
      })
    })
  })
}

export default getHNComments;
