const fs = require('fs');
// const http = require('http');
const Node_Twitter = require('twitter');

require('dotenv').config();

// tweet text
// tweet image from local folder
// tweet image from cloud
// reply with links for helping the NGOs
// like and retweet 'jaguar', 'onça', 'yaguareté' etc

/**
 * This class contains all functions pertinent to the bot actions
 * on Twitter. The Client Library used is node-twitter.
 */
class Twitter {
    /**
     * @constructor
     * @param {twitter object} client - client from node-twitter package
     * @param {*} name - ...
     */
    constructor() {        
        this.consumer_key = process.env.TWITTER_CONSUMER_KEY;
        this.consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
        this.access_token_key = process.env.TWITTER_TOKEN_KEY;
        this.access_token_secret = process.env.TWITTER_TOKEN_SECRET;
        
        this.client = new Node_Twitter({
            consumer_key: this.consumer_key,
            consumer_secret: this.consumer_secret,
            access_token_key: this.access_token_key,
            access_token_secret: this.access_token_secret
        });

        this.phrases = [
            "Probably a big fluffy cat. I'm still learning though. Did I get it right?",
            "Mehhhh just another stupid car. I'm still learning though. Did I get it right?",
            "I don't know what this is yet. I'm still learning though."
        ];
    }

    /**
     * Upon receiving a given text, posts it to twitter.
     * @param {string} text - text to be posted.
     */
    tweet_this(text) {
        this.client.post(
            "statuses/update", 
            { status: text },
            (err, twt, res) => {
                if(err) {
                    throw err;
                } else 
                console.log(`Response status: ${res.caseless.dict.status}`);
                console.log(`Just tweeted: ${twt.text}`);
            });
    }

    /** Generates a random number and post a text containing this number.
     * Avoids duplicate tweets.
     */
    tweet_game() {
        let r = Math.floor(Math.random() * 999);
        this.tweet_this(`here is a random number and its meaning: ${r} means you lost the game (:`);
    }

    /**
     * Receives an image and a text, makes a Post request to upload it, then makes
     * a Post request to post it.
     * @param {image} media_path - the image received to be posted.
     * @param {string} text - the text to be posted. If not given, will post default.
     */
    tweet_media(media_path, text='Nothing to see here, just testing media uploads') {
        // checking file size
        const file_size = fs.statSync(media_path)["size"] / 2 ** 10;
        const media_file = fs.readFileSync(media_path);
        // post request to upload media with file as parameter
        this.client.post(
            'media/upload', 
            { media: media_file },
            (err, media, res) => {  // this callback takes media
                if (!err) {
                    // if successful, a media object will be returned.
                    
                    console.log(`Media upload response status: ${res.caseless.dict.status}`);

                    var status = {
                        status: text,
                        // media ID string identifies the media
                        media_ids: media.media_id_string
                    }
                    
                    // posting the status and the media
                    this.client.post(
                        'statuses/update',
                        status, 
                        (err, twt, res) => {   // this callback takes tweet
                            if (!err) {
                                console.log(`New tweet response status: ${res.caseless.dict.status}`);
                                
                                console.log(twt.text);
                            } else console.log(err);
                        });
                } else console.log(err);
            });
    }

    confirm_image() {
        // (1 day) before posting the image, it will be sent as DM to me
        // i will reply yes/no to confirm if the image will be posted
        // if i don't reply it will be posted
    }
}

module.exports = Twitter;