const CronJob = require('cron').CronJob
import https from 'https'
import fs from 'fs'
import Promise from 'bluebird'

import Ebook from '../models/Ebook'
import schedules from './schedules.js'
import createEbook from '../news-parser'
import uploadToS3 from '../helpers/upload-to-s3'
//Quan s'inicia el server mira la programació establerta a schedules.js i crea 1 cronjob per cada parser
let timer = 0
function scheduleBundles(){
  schedules.forEach((schedule) => {
    timer = timer + 5;
    timer === 60 ? timer = 0 : ''
    const source = schedule.source
    const hourFreq = schedule.hourFreq
    const timeZone = schedule.timeZone
    const cronTime = `00 ${timer} ${hourFreq} * * *` // se creara el bundle cada horafreq horas, con un desfase de timer minutos
    new CronJob({
      cronTime: cronTime,
      onTick: function() {
      // variables declaration
        var ebookData
        var ebookSize
        var ebookSizeDB
      // create ebook
        createEbook([source])
        .then((data) => {
          ebookData = data
          // Ebook.remove({'parser': source}, {}, { sort: { 'time' : -1 } })
        })
        .then(() => {
          return new Promise((resolve) => {
            fs.stat(ebookData.epubPath,(err , stats) => { ebookSize = stats.size; return resolve(ebookSize) })
          })
        })
        .then(() => {
          Ebook.findOne({'parser': source}, {}, { sort: { 'time' : -1 } })
          .then((EbookDB) => {
            if(EbookDB != null){
              ebookSizeDB = EbookDB.size
            }else{ // primera vez que se hace un ebook de un parser
              ebookSizeDB = 0
            }
          })
          .then(() => {
            if (ebookSizeDB < ebookSize+5 || ebookSizeDB > ebookSize-5){
            }else{
              return new Promise((resolve, reject) => {
                uploadToS3(ebookData.epubPath, {bundleType: 'epub', name: ebookData.name})
                .then(() => {
                  uploadToS3(ebookData.mobiPath, {bundleType: 'mobi', name: ebookData.name})
                })
                .then(() => {
                  const time = new Date();
                  new Ebook({parser: source, name: ebookData.name, size: ebookSize, time: time}).save()
                  .then(() => {
                    resolve(true)
                  })
                })
              })
            }
          })
          .then(() => {
             fs.unlink(ebookData.epubPath, (err) => {
               if (err) throw err;
             });
             fs.unlink(ebookData.mobiPath, (err) => {
               if (err) throw err;
             });
           })
          .then(()=> {
            https.get("https://hchk.io/39f91551-ad45-4f81-8c2d-bb1b2bb109b2");
          })
        })
      },
      start: true,
      timeZone: timeZone
    })
  })
}
export default scheduleBundles;
