const Twitter = require('twitter');
// const { google } = require('googleapis');
const fs = require('fs');

const Bot = require('./Bot');
const Scraper = require('./Scraper');
const Vision = require('./Vision');

const twt_keys = require('./config/twitter-api');
// const g_keys = require('./config/google-api');
const bing_search_keys = require('./config/bing-search-api');
const cognitive_keys = require('./config/cognitive-api');

const results = {
  full: './data/full_results.json',
  url: './data/url_results.json'
};
const vis_res = './data/analyze.json';

const client = new Twitter({
  consumer_key: twt_keys.consumer_key,
  consumer_secret: twt_keys.consumer_secret,
  access_token_key: twt_keys.access_token_key,
  access_token_secret: twt_keys.access_token_secret
});

const bot = new Bot(client);
const scraper = new Scraper(bing_search_keys, results);
const vision = new Vision(cognitive_keys, vis_res);

// bot.tweet_game();
// bot.tweet_media(img);

// scraper.bing_img_search('black dog',50,50);