
// The schedule object saves the times at which each source bundle should be updated
// Documentation on how to write crontab: http://crontab.org/

const schedules = [
  // {
  //   source: 'elmundo',
  //   hourFreq: '*',
  //   timeZone: 'America/Los_Angeles'
  // },
  // {
  //   source: 'hackernews',
  //   hourFreq: '*/2',
  //   timeZone: 'America/Los_Angeles'
  // },
  // {
  //   source: 'newyorktimes',
  //   hourFreq: '*/6',
  //   timeZone: 'America/Los_Angeles'
  // },
  {
    source: 'askhackernews',
    hourFreq: '*',
    timeZone: 'America/Los_Angeles',
    healthcheckUrl: 'https://hchk.io/08576787-5063-45ff-ad57-f77338945100'
  },
  // {
  //   source: 'hackernews',
  //   hourFreq: '*',
  //   timeZone: 'America/Los_Angeles',
  //   healthcheckUrl: 'https://hchk.io/39f91551-ad45-4f81-8c2d-bb1b2bb109b2'
  // },
  {
    source: 'indiehackers',
    hourFreq: '*/3',
    timeZone: 'America/Los_Angeles',
    healthcheckUrl: 'https://hchk.io/8dd2a13f-3300-4dc6-a1c3-84d0f0556097'
  }
]

export default schedules;
