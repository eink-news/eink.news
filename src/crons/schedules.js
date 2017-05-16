
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
  // {
  //   source: 'indiehackers',
  //   hourFreq: '*/3',
  //   timeZone: 'America/Los_Angeles'
  // },
  {
    source: 'askhackernews',
    hourFreq: '*',
    timeZone: 'America/Los_Angeles'
  },
  {
    source: 'hackernews',
    hourFreq: '*',
    timeZone: 'America/Los_Angeles'
  }
]

export default schedules;
