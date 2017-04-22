import Promise from 'bluebird'
import Epub from 'epub-gen'
import uploadToS3 from '../helpers/upload-to-s3'
import fs from 'fs'
import https from 'https'
import http from 'http'
import zipper from 'mobi-zipper'
import path from 'path'

import sources from '../config/sources.json'
import modules from './modules'


const createEbook  = function(subscription) {

  const date = new Date()
  const day = date.getUTCDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const year = date.getFullYear()

  const filteredSource = sources.sources.filter(source => { // no se bien bien que hace
    return subscription.indexOf(source.key) > -1
  })

  // Works with only one domain for now
  const key = filteredSource[0].key
  const url = filteredSource[0].url
  const sourceName = filteredSource[0].name
  const locale = "en-us"
  const stringMonth = date.toLocaleString(locale, { month: "long" });
  const name = `${sourceName}_${hour}h${minute}-${day}-${stringMonth}-${year}`
  const epubPath = path.join(__dirname, `./${name}.epub`)
  const mobiPath = path.join(__dirname, `./${name}.mobi`)
  const mobiOptions = {
    input: epubPath,
    output: __dirname,
    clean: false,
    bookname: `${name}.mobi`
  }
console.log(url);
  return new Promise((resolve, reject) => {
    return new Promise(function(resolve){ //Obtencion de info de la pagina que queremoss parsear, tenemos en cuenta si es http o https
      if (url.indexOf("https") >= 0){
        console.log("https");
        https.get(url, (res) => {
          var data = []
          res.on('data', (d) => {
            data.push(d)
          }).on('end', function() {
              const ebook = Buffer.concat(data)
              resolve(ebook.toString())
          })
        }).on('error', (e) => {
          console.error(e)
          resolve(false)
        })
      }
      else{
        http.get(url, (res) => {
          console.log('http');
          var data = []
          res.on('data', (d) => {
            data.push(d)
          }).on('end', function() {
              const ebook = Buffer.concat(data)
              resolve(ebook.toString())
          })
        }).on('error', (e) => {
          console.error(e)
          resolve(false)
        })
      }
    })
    .then((ebook) => {
      return new Promise((resolve, reject) => {
        modules()[key](ebook)
          .then((content) => {
            const options = {
                title: `${sourceName} ${date}`,
                author: url,
                publisher: url,
                cover: `${url}/favicon.ico`,
                content
            }
            new Epub(options, epubPath).promise
              .then(function() {
                  resolve (epubPath)
               }, function(err) {
                  return reject(err)
              })
          })
      })
    })
    .then(() => {
      return new Promise ((resolve) => {
        zipper.create(mobiOptions).then(() => {
          resolve(mobiPath)
        }).catch(err => console.error(err))
      })
    })
    .then(() => {
      uploadToS3(epubPath, {bundleType: 'epub', name: name})
    })
    .then(() => {
      uploadToS3(mobiPath, {bundleType: 'mobi', name: name})
    })
    .then(() => {
      fs.unlink(epubPath, (err) => {
        if (err) throw err;
      });
      fs.unlink(mobiPath, (err) => {
        if (err) throw err;
      });
    })
    .catch(function (err) {
      console.log(err);
    //Upload an error epub & mobi bundle to s3 saying we are sorry
    //send us an email notifying something happened
      return reject(err)
    })
  })
}

export default createEbook
