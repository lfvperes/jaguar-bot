const fs = require('fs');

// loading image
const data = fs.readFileSync('image.jpg');

// tweet text
// tweet image from local folder
// tweet image from cloud
// reply with links for helping the NGOs
// like and retweet 'jaguar', 'onça', 'yaguareté' etc

class Bot {
    constructor(client) {
        this.client = client
    }

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

    tweet_game() {
        let r = Math.floor(Math.random() * 999);
        this.tweet_this(`here is a random number: ${r} means you lost the game (:`);
    }

    tweet_media() {
        // post request to upload media with file as parameter
        this.client.post(
            'media/upload', 
            { media: data },
            (err, media, res) => {  // this callback takes media
                if (!err) {
                    // if successful, a media object will be returned.
                    
                    var status = {
                        status: 'nice',
                        // media ID string identifies the media
                        media_ids: media.media_id_string
                    }
                    
                    // posting the status and the media
                    this.client.post(
                        'statuses/update',
                        status, 
                        (err, twt, res) => {    // this callback takes tweet
                            if (!err) {
                                console.log(twt.text);
                            }
                        });
                }
            })
    }

}

module.exports = Bot;