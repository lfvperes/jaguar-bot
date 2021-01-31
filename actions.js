const fs = require('fs');
const path = require('path');

// tweet text
// tweet image from local folder
// tweet image from cloud
// reply with links for helping the NGOs
// like and retweet 'jaguar', 'onça', 'yaguareté' etc

class Actions {
    constructor(client) {
        this.client = client
        this.TEST_IMAGE = fs.readFileSync(path.join(__dirname, 'image.jpg'));
    }

    check_credentials(){
        // verifying credentials
        client
        .get("account/verify_credentials")
        .then(results => {
            console.log("results", results);
        })
        .catch(console.error);
    }

    async tweet_this(text) {
        console.log('ve se foi');
        const tweet = await this.client.post("statuses/update", {
            status: text,
            auto_populate_reply_metadata: true
        })
        .catch(console.error);
    }

    tweet_game() {
        let r = Math.floor(Math.random() * 999);
        this.tweet_this(`here is a random number: ${r} means you lost the game (:`);
    }

    async tweet_picture() {
        // Upload picture
        const imageAltString = 'Animated picture of a dancing banana';
        const base64Image = new Buffer.from(this.TEST_IMAGE).toString('base64');
        const mediaUploadResponse = await this.client.post('media/upload', {
            media_data: base64Image,
        })
        .then(
        
            // Set alt text
            
            await this.client.post('media/metadata/create', {
                media_id: mediaUploadResponse.media_id_string,
                alt_text: { text: imageAltString },
            })
            .catch(console.error)
        )
        .catch(console.error);
    }

}

module.exports = Actions;