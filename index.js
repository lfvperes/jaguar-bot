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

const panther_results = {
  full: './data/panther/full_results.json',
  url: './data/panther/url_results.json'
};

const dog_results = {
  full: './data/dog/full_results.json',
  url: './data/dog/url_results.json'
};

const bot = new Bot(client);
// const scraper = new Scraper(bing_search_keys, results);
const scraper = new Scraper(bing_search_keys, dog_results);
const vision = new Vision(cognitive_keys, vis_res);

scraper.bing_img_search('black dog',50);

// bot.tweet_game();
// bot.tweet_media(img);
// scraper.bing_img_search('jaguar',5,22);
/*
if (fs.existsSync(results.url)) {
  var url_list = JSON.parse(fs.readFileSync(results.url)).unfiltered;
} else {
  console.log('nao deu');
  return;
}
for (const url of url_list) {
  vision.analyze('Tags', url);
}*/
/*
vision.analyze(
  'Tags',
  // 'https://cdn.pixabay.com/photo/2019/09/01/12/59/car-4445171_960_720.jpg',
  'https://cdn.pixabay.com/photo/2018/06/10/12/52/black-panther-3466399_960_720.jpg',
  true
);
*/