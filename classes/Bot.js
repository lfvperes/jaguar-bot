const fs = require('fs');
const Twitter = require('./Twitter');
const Scraper = require('./Scraper');
const Vision = require('./Vision');
const Storage = require('./Storage');

require('dotenv').config();

/**
 * This class contains all functions pertinent to the bot actions
 * on Twitter.
 */
class Bot {
  /**
   * @constructor
   */
  constructor() {

    this.twitter = new Twitter();
    this.scraper = new Scraper();
    this.vision = new Vision();

    this.phrases = [                      // phrases to be posted in tweet_learned()
      "Probably a big fluffy cat. I'm still learning though. Did I get it right?",
      "Mehhhh just another stupid car. I'm still learning though. Did I get it right?",
      "I don't know what this is yet. I'm still learning though."
    ];

    // default weekday when weekly routine will be executed (weekdays 0-6)
    this.default_weekday_rountine = 0;    // sunday

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
   * Replaces the oldest image blob with a new one (rotation), with the same name.
   * Also updates the JSON file containing the URL list.
   * @param {String} weekday - The name of the current day.
   */
  async new_post(weekday, start, select=0) {
    // wait for the file to be created
    setTimeout(async () => {
      
      
      this.scraper.bing_img_search(undefined, 1, start * 7 + select);

      // will not try to post if there are no URLs to post
      setTimeout(async () => {
        var url = this.scraper.latest_result;
            
        var tags = await this.vision.get_tags(url, false);
        var score = this.vision.analyze_tags(tags);
        if(score > 0) {
          // download image locally and get path
          var filename = await this.scraper.download_from_url(url);
          if(!filename) {
            var filename = await this.scraper.download_from_url(url, undefined, false);
          }
          // wait for the file to be downloaded
          setTimeout(() => {
            // resize image when needed
            if(fs.statSync(filename)["size"] > 5 * 2 ** 20) {
              this.scraper.resize_img(filename);
            }
            this.twitter.tweet_media(filename, undefined, weekday);
            setTimeout(() => {
              // delete file locally
              fs.unlinkSync(filename);
            }, 1000);
          }, 1000);
        } else {
          console.log("This was a car. I'm not posting that.");
          select++;
          this.new_post(weekday, start, select);
        }
            

      }, 1000);
    }, 1500);
  }

  undo_new_post() {
    
  }

  /**
   * Takes URLs from the list under "unfiltered", passes it through the CV 
   * API, get and analyze tags, and finally place the URLs under "unfiltered", 
   * "selected/not_posted" or "rejected". Also updates the JSON file containing 
   * the URL list.
   * @param {int} N - The number of URLs to be filtered.
   */
  async filter_url(N=7) {
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

      // console.log(new_url_list);

      // updating list locally
      fs.writeFileSync(url_list_filename, JSON.stringify(new_url_list));

    } else {
      console.log(`The file ${url_list_filename} does not exist.`);
    }
  }
  
  /**
   * Default daily routine, to be executed 4 times a day. Makes a new post, tracks 
   * the day of the week to execute weekly routine. 
   */
  async daily_routine() {
    const today = new Date();
    const weekday = today.getDay();
    // change search offset based on current week
    const week = Math.ceil((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24 * 7));

    // making new post
    await this.new_post(weekday);

    setTimeout(() => {
      // executing weekly routine when it's the defined day (weekdays 0-6)
      if (weekday === this.default_weekday_rountine) this.new_photos(week);
    }, 10000);
  }

  new_photosaaaa(week) {
    if (weekday === this.default_weekday_rountine) this.weekly_routine(week);
    // waiting for new post to be completed and all files updated
    
  }

  /**
   * Default weekly routine,  to be executed once a day before all posts of that day.
   * Searches for new images, stores, filters and select new URLs.
   * @param {int} week - The number of the current week (0-51 in a year).
   */
  async new_photos(week) {
    
    var url_list = JSON.parse(fs.readFileSync(this.scraper.url_results));
    var not_posted = url_list.selected.not_posted;
    var unfiltered = url_list.unfiltered;
    if (not_posted.length < 4 && unfiltered.length < 4) {
      // search and update list (locally)
      this.scraper.bing_img_search(undefined, 10, week * 7);
      // filter URLs and update list (locally)
      await this.filter_url(10);
    } else if (not_posted.length < 4) {
      await this.filter_url(10);
    } else if (unfiltered.length < 4) {
      this.scraper.bing_img_search(undefined, 10, week * 7);
    }
      
    // wait for local files to be updated
    setTimeout(() => {
      // updating list blob in the cloud
      this.storage.put_blob('jsondata', this.scraper.url_results);
    }, 10000);
    
  }

  logs_dm() {
    // send information (responses, errors etc) as DM via twitter
  }

}

module.exports = Bot;