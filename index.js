const Twitter = require('twitter');
//const { google } = require('googleapis');

const Bot = require('./Bot');
const Crawler = require('./Crawler');

const config = require('./config');
const gk = require('./google_keys');

const client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});

const bot = new Bot(client);
const crawler = new Crawler(gk);

//bot.tweet_game();
//bot.tweet_media();
crawler.get_images('jaguar');