import jsdom from 'jsdom'
import Promise from 'bluebird'

function getArticleContent(article) {
  return new Promise((resolve) => {
    jsdom.env({
      url: article.link,
      scripts: ["http://code.jquery.com/jquery.js"],
      done: function (err, window) {
        var $ = window.$
        var text = ''
        $('*').each(function() {
          if ($(this).is('h1')) {
            text = text + '<h1>' + $(this).text() + '</h1>'
          }
          if ($(this).is('h2')) {
            text = text + '<h2>' + $(this).text() + '</h2>'
          }
          if ($(this).is('h3')) {
            text = text + '<h3>' + $(this).text() + '</h3>'
          }
          if ($(this).is('p')) {
            text = text + '<p>' + $(this).text() + '</p>'
          }
        })
        window.close()
        resolve(text)
      }
    })
  })
}

const hackernews = function(ebook) {
  return new Promise((resolve) => {
    jsdom.env(
      ebook,
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        var $ = window.$;
        var articles = []
        $("td.title:not(:last) a.storylink").each(function() {
          const title = $(this).text()
          var link = $(this).attr('href')
          link = link.includes('http') ? link : 'https://news.ycombinator.com/'+link
          articles.push({title: title, link: link})
        })
        const articlePromises = articles.map(article => {
          return getArticleContent(article).then(text => {
            const regex = /<header"[^>]*>((?:.|\r?\n)*?)<\/header>/g
            const textWithoutHeader = text.replace(regex, '')
            article.data = textWithoutHeader
            delete article.link
            return article
          })
        })
        Promise.all(articlePromises).then(articles => resolve(articles))

      })
  })
}

export default hackernews
