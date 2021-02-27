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
        
        // content to be randomly chosen and posted with the pictures
        this.phrases = JSON.parse(fs.readFileSync('./data/tweet_content.json')).phrases;
        
        // content to be randomly chosen and posted with the pictures
        this.hashtags = JSON.parse(fs.readFileSync('./data/hashtags.json')).hashtags;
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
     * a Post request to post it. If no text was received, chooses randomly from the
     * default list. Also receives a day of the week and adds corresponding hashtag.
     * @param {image} media_path - the image received to be posted.
     * @param {string} text - the text to be posted. If not given, will post default.
     * @param {int} hashtag - the number of the day in the week (0-6) to choose a 
     * hashtag from the list.
     */
    tweet_media(media_path, text='', hashtag_index='') {
        if(!text) {
            // if not specified, choose randomly from the default list
            text = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        }
        if(hashtag_index){
            // adding hashtag to the end to the text, if not empty
            text += this.hashtags[hashtag_index] ? ' #' + this.hashtags[hashtag_index] : '';
        }
        // checking file size
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

    /**
     * Opens a stream to listen to tweets that include the given term in
     * its status text.
     * @param {String} terms - Word or phrase to be searched.
     */
    stream_statues(terms) {
        var stream = this.client.stream('statuses/filter', {track: terms});
        var count = 0;
        stream.on('data', (event) => {
            if(count < 5) {
                this.like_tweet(event && event.id_str);
                // console.log('Liking this tweet:');
                console.log(event && event.text);
                count++;
            }
        });

        stream.on('error', (err) => {
            throw err;
        });
    }

    /**
     * Performs a twitter search based on given term. Results may include accounts
     * whose name includes the search term, beside tweets whose statuses include 
     * the search term.
     * @param {String} terms - The word or phrase to be searched.
     * @param {int} count - The number of tweets to be returned.
     */
    async search_tweets(terms, count=15) {
        console.log(`Searching for ${count} tweets about ${terms}...`);
        var tweets = [];
        this.client.get('search/tweets', {q: terms, count: count}, (err, twt, res) => {
            for (const status of twt.statuses) {
                // array containing only texts
                let texts = tweets.map((tweet) => { return tweet.text; });
                // avoid duplicates
                if(!texts.includes(status.text)) {
                    // array of objects containing text and id_str
                    tweets.push({id_str: status.id_str, text: status.text});
                }
            }
            
            console.log(`Found ${tweets.length} unique tweets`);
            console.log('-------------------------------');
        });
        return tweets;
    }

    async like_tweet(twt_id, text='') {
        this.client.post('favorites/create', {id: twt_id}, (err) => {
            if(text) {
                console.log(`Liking this tweet:`);
                console.log(`ID ${twt_id}`);
                console.log(`Text ${text}`);
            } else {
                console.log(`Liking the tweet with ID ${twt_id}`);
            }
            if(err) {
                if(err[0].code != 139) {
                    throw err;
                } else {
                    console.log(err[0].message);
                }
            } else {
                console.log('Liked!');
            }
            console.log('-------------------------------');
        });
    }

    confirm_image() {
        // (1 day) before posting the image, it will be sent as DM to me
        // i will reply yes/no to confirm if the image will be posted
        // if i don't reply it will be posted
    }
}

module.exports = Twitter;