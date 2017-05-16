# eink.news

[![eink.news](http://i.imgur.com/jhZ525G.png)](http://eink.news)

App that allows you to do periodical or sporadic creation of ebooks with the content of a certain number of news websites and blogs.

### Why?
> **Readability and availability. The best from ebooks and mobile phones.** - " team members "

### Supported sources

The current table displays the production ready sources, but other sources might be in development mode.

| Source | website | epub sample | kindle sample |
| ------ | ------ | ------ | ------ |
| Hacker News | [news.ycombinator.com] | [download](http://hnepub.com) | [download](http://hnkindle.com) |
| Ask Hacker News | [news.ycombinator.com/ask] | [download](http://ahnepub.com) | [download](http://ahnkindle.com) |
| IndieHackers | [indiehackers.com] | [download](http://ihepub.com) | [download](http://ihkindle.com) |

### Tech

eink.news uses a number of open source projects to work properly:

* [node.js](http://nodejs.org) - evented I/O for the backend
* [Cron](https://github.com/kelektiv/node-cron) - cronjobs in node.js
* [fork of mobi-zipper](https://github.com/Hacalox/mobi-zipper) - to create mobi files that the kindle can read
* [readability](https://github.com/mozilla/readability) - standard website parsing

### Installation

Install the dependencies and devDependencies.

```sh
$ cd eink.news
$ npm install
```

Create your env variables and edit them to fill your needs

```sh
$ cp .example.env .env
```

### Usage

eink.news can either be used for single bundle creations or to be deployed in a server that runs the cronjobs periodically.

To create a **single bundle** run:

```sh
$ PARSER=hackernews npm run parse
```
Where hackernews can be any source name without spaces and capital letters.

To **start the server**:
```sh
$ npm run start
```

To run the **development server**:
```sh
$ npm run dev
```

**Testing**: (no tests are specified yet)
```sh
$ npm run test
```

### Development

Want to contribute? Great!

You should run the `npm run dev` command previously stated, which will track file changes and rerun the app when there's one.

You can contribute everywhere but we highly recommend **creating or improving parsers**. By doing so, you are adding more value to the users, which will be able to access more or better content.

For **detailed instructions** of how parsers work and how to create a new parser, go **[here](https://github.com/eink-news/eink.news/blob/master/PARSERS.md)**.


License
----

MIT


[//]: # (Links to the sources)

   [news.ycombinator.com]: <https://news.ycombinator.com>
   [news.ycombinator.com/ask]: <https://news.ycombinator.com/ask>
   [indiehackers.com]: <https://www.indiehackers.com/businesses>
   [HNepub]: <https://hnepublink.com>
   [AHNepub]: <https://hnepublink.com>
   [IHepub]: <https://hnepublink.com>
   [HNkindle]: <https://hnkindlelink.com>
   [AHNkindle]: <https://hnkindlelink.com>
   [IHkindle]: <https://hnkindlelink.com>
