const CronJob = require('cron').CronJob
import https from 'https'
import fs from 'fs'
import Promise from 'bluebird'

import Ebook from '../models/Ebook'
import schedules from './schedules.js'
import createEbook from '../news-parser'
import uploadToS3 from '../helpers/upload-to-s3'
//Quan s'inicia el server mira la programació establerta a schedules.js i crea 1 cronjob per cada parser
let timer = 0;
function scheduleBundles(){
  schedules.forEach((schedule) => {
    timer = timer + 5;
    timer > 50  ? timer = 0 : ''
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
          console.log(ebookData);
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
              console.log("first time");
            }
          })
          .then(() => {
          console.log(ebookSize);
          console.log(ebookSizeDB);
            if (ebookSizeDB < ebookSize+100 && ebookSizeDB > ebookSize-100){
              console.log('same-size');
              return(true)
            }else{
              console.log('different-size');
              return uploadToS3(ebookData.epubPath, {bundleType: 'epub', name: ebookData.name})
              .then(() => {
                return uploadToS3(ebookData.mobiPath, {bundleType: 'mobi', name: ebookData.name})
              })
              .then(() => {
                console.log('db');
                const time = new Date();
                return new Ebook({parser: source, name: ebookData.name, size: ebookSize, time: time}).save()
              })
              .then(() => {
                return (true)
              })
            }
          })
          .then(() => {
            console.log('deleting-files');
             fs.unlink(ebookData.epubPath, (err) => {
               if (err) throw err;
             });
             fs.unlink(ebookData.mobiPath, (err) => {
               if (err) throw err;
             });
           })
          .then(()=> {
            console.log(schedule.source);
            console.log(schedule.healthcheckUrl);
            const healthcheckUrl = schedule.healthcheckUrl
            https.get(healthcheckUrl);
          })
        })
      },
      start: true,
      timeZone: timeZone
    })
  })
}
export default scheduleBundles;
