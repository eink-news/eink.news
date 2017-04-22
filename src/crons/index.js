const CronJob = require('cron').CronJob
import https from 'https'

import schedules from './schedules.js'
import createEbook from '../news-parser'
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
        // Ara mateix la funció createEbook llegia el bundleType i les subscriptions d'un user per a crear el ebook corresponent
        // a les seves necessitats.
        // Cal fer de nou el index.js de news-parser per a que ara el que revi sigui només el nom del source del que s'ha de crear
        // el bundle
        createEbook([source]).then(()=> {
          https.get("https://hchk.io/39f91551-ad45-4f81-8c2d-bb1b2bb109b2");
        })

      },
      start: true,
      timeZone: timeZone
    })
  })
}
export default scheduleBundles;
