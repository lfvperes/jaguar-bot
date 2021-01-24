/** 
 * First steps on creating a Twitter Bot
 * Luís Peres, 2021
 */

var Twit = require('twit');         // Twitter API Client for node (REST & Streaming API)
var config = require('./jaguar_bot/config');   // Keys & Tokens stored in a separate file
var fs = require('fs');             // handling files
var gPse = require('./google_pse');
var img = require('./images');

console.log('Starting bot');

// twit object
var T = new Twit(
  config,
  {
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true     // optional - requires SSL certificates to be valid.
  });

let interval = 1000 * 30;           // 30s between tweets
//tweetTheGame();
//setInterval(tweetTheGame, interval);

setInterval(() => {
  tweetPicture();
  tweetTheGame();
}, interval);

function tweetPicture() {  
  // create json file containing image links
  gPse.get_images();

  // downloading an image
  img.download_from('./image_links.json');

  let filename = './img/image.jpg';
  let params = { encoding: 'base64' };
  let b64 = fs.readFileSync(filename, params);

  // uploading the image before tweeting it
  T.post('media/upload', { media_data: b64 }, uploaded);

  function uploaded(err, data, response) {
    // now the image can be tweeted
    let id = data.media_id_string;
    // this tweet has not only status but also a media id
    let tweet = {
      status: 'TESTANDO bot',
      media_ids: [id]               // the id is in an array because it could be multiple ids (from multiple media)
    };

    // posting tweet
    T.post('statuses/update', tweet, tweeted);
  }
}

function tweetThis(content) {
  // text in the tweet to be posted
  var tweet = {
    status: content
  };

  // posting tweet
  T.post('statuses/update', tweet, tweeted);
}

// callback function to post method
function tweeted(err, data, response) {
  if (err) {
    console.log('Something went wrong!');
  } else {
    console.log('Yay it worked!');
    console.log('Text tweeted: ' + data.text);
    console.log('Date of the tweet: ' + data.created_at);
  }
}

function tweetTheGame() {
  // random number to differentiate tweets
  r = Math.floor(Math.random() * 100);

  tweetThis('here is a random number: ' + r + ' means you lost the game (:');
}