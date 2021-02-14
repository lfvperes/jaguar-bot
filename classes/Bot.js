const fs = require('fs');
const Twitter = require('./Twitter');
const Scraper = require('./Scraper');
const Vision = require('./Vision');
const Storage = require('./Storage');

require('dotenv').config();

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
    constructor() {
        this.twitter = new Twitter();
        this.scraper = new Scraper();
        this.vision = new Vision();
        this.storage = new Storage();
        
        this.phrases = [
            "Probably a big fluffy cat. I'm still learning though. Did I get it right?",
            "Mehhhh just another stupid car. I'm still learning though. Did I get it right?",
            "I don't know what this is yet. I'm still learning though."
        ];
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
                this.twitter.tweet_media(filename, phrase);
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