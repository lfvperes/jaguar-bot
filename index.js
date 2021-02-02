const Twitter = require('twitter');
// const { google } = require('googleapis');
const fs = require('fs');

const Bot = require('./Bot');
const Crawler = require('./Crawler');

const twt_keys = require('./config/twitter-api');
const g_keys = require('./config/google-api');

const client = new Twitter({
    consumer_key: twt_keys.consumer_key,
    consumer_secret: twt_keys.consumer_secret,
    access_token_key: twt_keys.access_token_key,
    access_token_secret: twt_keys.access_token_secret
});

const bot = new Bot(client);
const crawler = new Crawler(g_keys);

// loading image
const img = fs.readFileSync('./data/img/image.jpg');

// bot.tweet_game();
// bot.tweet_media(img);
crawler.get_images('jaguar');