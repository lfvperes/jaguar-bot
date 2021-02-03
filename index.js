const Twitter = require('twitter');
// const { google } = require('googleapis');
const fs = require('fs');

const Bot = require('./Bot');
const Scraper = require('./Scraper');

const twt_keys = require('./config/twitter-api');
const g_keys = require('./config/google-api');
const image_links = './data/image_links.json';

const client = new Twitter({
    consumer_key: twt_keys.consumer_key,
    consumer_secret: twt_keys.consumer_secret,
    access_token_key: twt_keys.access_token_key,
    access_token_secret: twt_keys.access_token_secret
});

const bot = new Bot(client);
const scraper = new Scraper(g_keys, image_links);

// bot.tweet_game();
// bot.tweet_media(img);
// scraper.search_images('jaguar');
// scraper.download_from('https://dialogochino.net/wp-content/uploads/2020/07/jaguar-3370498_1920-1440x720.jpg');
// scraper.get_images('./data/image_links.json');
//scraper.download_from();

scraper.search_images('cabeca de cavalo');