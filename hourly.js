const Bot = require('./classes/Bot');

const bot = new Bot();

(async () => {
  var results = await bot.twitter.search_tweets('jaguar',10);
  setTimeout(() => {
    for (const tweet of results) {
      bot.twitter.like_tweet(tweet.id_str, tweet.text);
    }
  }, 2000);
})()
