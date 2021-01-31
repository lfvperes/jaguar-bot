const Twitter = require('twitter-lite');
const Actions = require('./actions');
const config = require('./config');


const client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});

const actions = new Actions(client);


actions.tweet_game();