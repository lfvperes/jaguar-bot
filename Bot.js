const fs = require('fs');

// tweet text
// tweet image from local folder
// tweet image from cloud
// reply with links for helping the NGOs
// like and retweet 'jaguar', 'onça', 'yaguareté' etc

/**
 * This class contains all functions pertinent to the bot actions.
 */
class Bot {
    /**
     * @constructor
     * @param {twitter object} client - client from node-twitter package
     */
    constructor(client) {
        this.client = client
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
                if(err) throw err;
                console.log(twt);
            });
    }

    /** Generates a random number and post a text containing this number.
     * Avoids duplicate tweets.
     */
    tweet_game() {
        let r = Math.floor(Math.random() * 999);
        this.tweet_this(`here is a random number: ${r} means you lost the game (:`);
    }

    /**
     * Receives an image and a text, makes a Post request to upload it, then makes
     * a Post request to post it.
     * @param {image} media_file - the image received to be posted.
     * @param {string} text - the text to be posted. If not given, will post default.
     */
    tweet_media(media_file, text='Nothing to see here, just testing a new key AGAIN >:(') {
        // post request to upload media with file as parameter
        this.client.post(
            'media/upload', 
            { media: media_file },
            (err, media, res) => {  // this callback takes media
                if (!err) {
                    // if successful, a media object will be returned.
                    
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
                                console.log(twt.text);
                            }
                        });
                }
            });
    }

}

module.exports = Bot;