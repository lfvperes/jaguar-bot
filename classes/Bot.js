const fs = require('fs');
const Scraper = require('./Scraper');
const Vision = require('./Vision');

// tweet text
// tweet image from local folder
// tweet image from cloud
// reply with links for helping the NGOs
// like and retweet 'jaguar', 'onça', 'yaguareté' etc

/**
 * This class contains all functions pertinent to the bot actions
 * on Twitter.
 */
class Bot {
    /**
     * @constructor
     * @param {twitter object} client - client from node-twitter package
     * @param {*} name - ...
     */
    constructor(client, scraper, vision, storage) {
        this.client = client;
        this.scraper = scraper;
        this.vision = vision;
        this.vision = storage;
        
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
        console.log('ve se foi');
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
        const media_file = fs.readFileSync(media_path);
        // post request to upload media with file as parameter
        this.client.post(
            'media/upload', 
            { media: media_file },
            (err, media, res) => {  // this callback takes media
                if (!err) {
                    // if successful, a media object will be returned.
                    
                    console.log(`Response status: ${res.caseless.dict.status}`);

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
                                console.log(`Response status: ${res.caseless.dict.status}`);
                                
                                console.log(twt.text);
                            } else console.log(err);
                        });
                } else console.log(err);
            });
    }

    /**
     * Receives a URL to a picture, analyzes the picture and tweet
     * about what it is: A jaguar (animal), a jaguar (car) or something
     * else (unknown).
     * @param {string} url - The URL for the picture to be analyzed.
     */
    async tweet_learned(url) {
        const tags = await this.vision.get_tags(url, false);
        const score = this.vision.analyze_tags(tags);
        const phrase = score > 0 ? this.phrases[0] : score < 0 ? this.phrases[1] : this.phrases[2];
        const picture = this.scraper.download_from_url(url);
        picture.then(
            (filename) => {
                this.tweet_media(filename, phrase);
            }
        );
        
    }

    update_container() {
        // get url from list under 'selected'
        // download image
        // upload image as blob to container
        // delete oldest blob in the container
    }

    confirm_image() {
        // (1 day) before posting the image, it will be sent as DM to me
        // i will reply yes/no to confirm if the image will be posted
        // if i don't reply it will be posted
    }

    logs_dm() {
        // send information (responses, errors etc) as DM via twitter
    }

}

module.exports = Bot;