const Bot = require('./classes/Bot');


const bot = new Bot();

// bot.twitter.tweet_game();
// bot.scraper.bing_img_search('jaguar');
bot.storage.put_blob('jaguar-container', './data/foto.jpg');
// bot.storage.list_containers();