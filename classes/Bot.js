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
    this.storage = new Storage('jaguar-container');

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

  /**
   * Replaces the oldest blob with a new one (rotation), with the same name.
   * @param {String} blob_name - The name of the blob to be replaced (and the
   * blob, which is the same name).
   */
  async update_blob(blob_name = '') {
    // get url from list under 'selected'
    // download image
    // upload image as blob to container
    // delete oldest blob in the container (replaced by upload)

    // const filename = './data/img/foto.jpg';
    // this.storage.put_blob('jaguar-container', filename, blob_name);

    // GET method to list blobs, creating file with the response
    this.storage.list_blobs();
    var blobs;
    // wait for the file to be created
    setTimeout(async () => {
      // array with name, date and size
      blobs = this.storage.list_blob_time();
      console.log(`There are ${blobs.length} blobs, the maximum is ${this.storage.dataset_size+1}`);
      // if there are enough blobs, one must be replaced
      if (blobs.length >= this.storage.dataset_size) {
        let oldest_blob = {
          date: new Date()
        };
        for (const blob of blobs) {
          // the blob to be replaced is the oldest
          if (oldest_blob.date > blob.date) {
            oldest_blob = blob;
          }
        }
        console.log('The oldest blob is:');
        console.log(oldest_blob);
        var blob_name = oldest_blob.name;
      } else {
        // if there are 0 blobs, the new blob is image0.jpg etc
        var blob_name = `image${blobs.length}.jpg`;
      }

      // update list (posted/not_posted)
      var url = this.scraper.url_to_post();
      // will not try to post if there are no URLs to post
      if(url) {
        // download image locally
        const filename = await this.scraper.download_from_url(url);
        // upload new blob
        this.storage.put_blob(this.storage.default_container, filename, blob_name);
        this.twitter.tweet_media(filename);
      }

    }, 500);
    

  }

  /**
   * Takes URLs from the list under "unfiltered", passes it through the CV 
   * API, get and analyze tags, and finally place the URLs under "unfiltered", 
   * "selected, not_posted" or "rejected".
   * @param {int} N - The number of URLs to be filtered.
   */
  async filter_url(N = 5) {
    console.log(`Filtering ${N} images...`);
    console.log('-------------------------------');
    const url_list_filename = this.scraper.url_results;
    // checking if 'url list' file exists before opening it
    if (fs.existsSync(url_list_filename)) {
      // reading file and parsing into object
      var url_list = JSON.parse(fs.readFileSync(url_list_filename));

      // storing each sublist in an array
      var unfiltered = url_list.unfiltered.slice(N, -1);  // will remain unfiltered
      var filtered = url_list.unfiltered.slice(0, N);     // will be filtered now
      var posted = url_list.selected.posted;              // will remain unchanged
      var selected = url_list.selected.not_posted;        // may be updated
      var rejected = url_list.rejected;                   // may be updated

      // iterate through list to filter individually
      for (let url of filtered) {
        console.log(`Image #${filtered.indexOf(url) + 1}:`);
        // analyze the image to decide between select/reject
        const tags = await this.vision.get_tags(url, false);
        const score = this.vision.analyze_tags(tags);

        if (score > 0) {
          // selected
          selected.push(url);
        } else if (score < 0) {
          // rejected
          rejected.push(url);
        } else {
          // score == 0: back to unfiltered
          unfiltered.push(url);
        }
      }

      // creating the updated list of URLs
      const new_url_list = {
        unfiltered: unfiltered,
        selected: {
          posted: posted,
          not_posted: selected
        },
        rejected: rejected
      };

      console.log(new_url_list);
      // updating list in the file
      fs.writeFileSync(url_list_filename, JSON.stringify(new_url_list));

    } else {
      console.log(`The file ${url_list_filename} does not exist.`);
    }
  }

  logs_dm() {
    // send information (responses, errors etc) as DM via twitter
  }

}

module.exports = Bot;