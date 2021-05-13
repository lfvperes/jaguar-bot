'use strict';
const https = require('https');
const fs = require('fs');
const imgDl = require('image-downloader');
const sharp = require('sharp');

require('dotenv').config();

/**
 * Performs image searchs, saves image URLs received as 
 * results from the Bing Image Search API, downloads image 
 * files from given URLs.
 */
class Scraper {
  /**
   * @constructor
   */
  constructor() {

    // defining search parameters and keys
    this.key = process.env.BING_IMG_KEY;  // subscription key
    this.host = 'api.bing.microsoft.com'; // base bing path
    this.path = '/v7.0/images/search';    // specifying type of search
    this.count = 10;                      // default results count per search
    this.offset = 1;                      // default first result
    // default search terms
    this.terms_path = './data/bing/search_terms.json'
    this.terms = JSON.parse(fs.readFileSync(this.terms_path)).terms;

    // where to store results
    this.full_results = './data/full_results.json';
    this.url_results = './data/url_results.json';
    this.url_list;

    this.latest_result = '';

  }

  /**
   * Callback function that handles and parses the responses, 
   * including how the search results will be processed.
   * @param {object} res - response from GET request on search
   */
  res_handler = function (res, context) {
    // this variable will containg the body of the JSON response
    let body = '';

    // storing body
    res.on('data', (dat) => {
      body += dat;
    });

    // when signaling 'end' flag
    res.on('end', () => {
      // parsing response
      let img_results = JSON.parse(body);
      // empty array to store URLs
      let url_list = [];

      if (img_results.value.length > 0) {
        // get first result
        let fst_img_result = img_results.value[0];

        context.latest_result = img_results.value[0].contentUrl;

        console.log(`Found ${img_results.value.length} result(s)!`);
        console.log(`First image web search url: ${fst_img_result.contentUrl}`);

        // extracting and storing URLs in array
        img_results.value.forEach((r) => { url_list.push(r.contentUrl); });
        // writing full results in file
        // fs.writeFileSync(context.full_results, body,
        //   (err) => {
        //     console.log('Error: ' + err.message);
        //   });


      } else console.log("No results");

      // context.update_url_list();
    });

    // handling errors
    res.on('error', (err) => {
      console.log('Error: ' + err.message);
    });
  };

  /**
   * Performs a search using the Bing Image Search API, given the 
   * search term, the amount of results and the starting results. 
   * If not given, all of them will set to default. The response 
   * handler writes the results in two JSON files, one for the full
   * body of the response and other only for the list of URLs.
   * @param {string} search_term - word or phrase to be searched
   * @param {int} r_count - how many results will be returned
   * @param {int} start - first result
   */
  bing_img_search(search_term = '', r_count = this.count, start = this.offset) {
    if (!search_term) {
      // if not specified, choose randomly from the default list
      search_term = this.terms[Math.floor(Math.random() * this.terms.length)];
    }
    console.log(`Searching for ${r_count} "${search_term}" images, starting from #${start}...`);

    // constructing search request and query
    const req_params = {
      method: 'GET',
      hostname: this.host,
      path: this.path + '?q=' + encodeURIComponent(search_term) + `&count=${r_count}&offset=${start}`,
      headers: {
        'Ocp-Apim-Subscription-Key': this.key,
      }
    };

    // making GET request and flagging 'end'
    let req = https.request(req_params, (res) => {
      // passing context to call functions inside callback
      this.res_handler(res, this);
    });
    req.end();

  }

  /**
   * Takes the full results in the JSON file, extracts URLs and save them.
   * To save the new URLs, the existing file is read for the new URLs
   * to be added to the array. The array is then saved again.
   * If the file doesn't not exist it will be created. 
   * Must be called when a new search is performed.
   * @param {string} results - parsed JSON file body containing metadata about results
   */
  update_url_list() {
    // empty array to store URLs
    var new_url_list = [];
    // to call the function again after creating empty file for the first time
    var recursion = false;
    // count how many new URLs were added
    let count_new = 0;

    // checking if 'full results' file exists before opening it
    if (fs.existsSync(this.full_results)) {

      // reading file and parsing into object
      var new_results = JSON.parse(fs.readFileSync(this.full_results));
      // extracting and storing new URLs in array
      new_results.value.forEach((r) => { new_url_list.push(r.contentUrl) });
      // removing duplicates between the new URLs, if any
      new_url_list = [...new Set(new_url_list)];

      // checking if 'url list' file exists before opening it
      if (fs.existsSync(this.url_results)) {

        // reading file and parsing into object
        var old_url_list = JSON.parse(fs.readFileSync(this.url_results));
        // adding new URLs into array under 'unfiltered'
        new_url_list.forEach((url) => {
          if (  // avoid adding an URL that is already on the list
            !old_url_list.unfiltered.includes(url) &&
            !old_url_list.selected.posted.includes(url) &&
            !old_url_list.selected.not_posted.includes(url) &&
            !old_url_list.rejected.includes(url)
          ) {
            old_url_list.unfiltered.push(url);
            count_new++;
            console.log(`#${new_url_list.indexOf(url) + 1}: New URL. Saving ${url}`);
          } else {
            console.log(`#${new_url_list.indexOf(url) + 1}: Duplicate URL. Skipping ${url}`);
          }
        });

        console.log(`Saving ${count_new} new URLs to the unfiltered list, from ${new_url_list.length} found`);
        console.log('-------------------------------');

      } else {  // if the file doesn't exist, create it
        console.log(`The file ${this.url_results} does not exist`);
        console.log('Creating file (empty) now...');
        var old_url_list = {
          unfiltered: [],
          selected: {
            posted: [],
            not_posted: []
          },
          rejected: []
        };

        recursion = true;
      }

      // storing in variable for external use
      this.url_list = old_url_list;
      // writing URL list in file (empty if it doesn't exist, to create it)
      fs.writeFileSync(this.url_results, JSON.stringify(old_url_list));
      // if the file was created for the first time, call the function again
      if (recursion) this.update_url_list();

    } else {
      console.log(`The file ${this.full_results} does not exist`);
      console.log('-------------------------------');
    }
  }

  /**
   * Updates the URL list changing the first URL from selected/not_posted to 
   * selected/posted. Returns the URL.
   */
  url_to_post() {
    // open and parse file into js object
    var url_list = JSON.parse(fs.readFileSync(this.url_results));
    // check if there are selected URLs to posted
    if (url_list.selected.not_posted.length != 0) {
      // remove the first element of not_posted
      var url = url_list.selected.not_posted.shift();
      // push that URL to the posted list
      url_list.selected.posted.push(url);
      // update the file with the new list
      fs.writeFileSync(this.url_results, JSON.stringify(url_list));
    } else {
      console.log('There are no new URLs to be posted');
      url = ''
    }

    return url;
  }

  /**
   * Delete failed url from list
   */
  undo_url_to_post() {
    // open and parse file into js object
    var url_list = JSON.parse(fs.readFileSync(this.url_results));
    // remove the last element of posted
    var url = url_list.selected.posted.pop();
    console.log(`Removing this URL from the list: ${url}`);
    // update the file with the new list
    fs.writeFileSync(this.url_results, JSON.stringify(url_list));
  }

  /**
   * Receives a URL to download an image and returns the path to where
   * the file was saved.
   * If an invalid argument is passed, breaks and returns nothing. That
   * includes empty or no arguments.
   * @param {string} url - URL from which the image will be downloaded.
   * @param {string} img_name - The path and name of the resulting file.
   */
  async download_from_url(target_url, img_name, https = true) {
    let img_id = '';    // different names for each image

    // Checking if any parameter was passed
    if (!target_url) {     // No argument URL was passed
      console.log('No URL received.');
      console.log('-------------------------------');
      return;
    } else {        // In case an argument was passed
      // checking if it is a string
      if (typeof (target_url) === 'string') {
        if (https) {
          target_url = target_url.replace(/http:/, 'https:');
        } else {
          target_url = target_url.replace(/https:/, 'http:');
        }
        console.log(`Downloading image from the URL: ${target_url}...`);
      } else {    // if it is not, then it is not a URL
        console.log('Not a valid URL.');
        console.log('-------------------------------');
        return;
      }
    }

    // making each file name unique using date in ms
    if (!img_name) {
      let time = new Date();
      img_id = time.getTime();
    } else img_id = img_name;

    // parameters to the image downloader
    const options = {
      url: target_url,
      dest: `./data/img/image${img_id}.jpg`
    };

    // downloading image
    var path = await imgDl.image(options)
      .then(({ filename }) => {
        // saved to /path/to/dest/photo
        console.log('Saved to', filename);
        console.log('-------------------------------');
        return filename;
      })
      .catch((err) => console.log(err));

    // the path could be accessed from options.dest
    // but this alternative will wait for the promise
    return path;
  }

  /**
   * Receives an array of strings, which should be valid URLs, then
   * iterates through the array and downloads the pictures from each
   * one. Returns an array of strings containing the paths to where
   * the files were saved.
   * @param {Array} url_list - Array containing URLs from where the 
   * images will be downloaded.
   */
  async download_from_list(url_list) {
    var path_list = [];
    console.log('Downloading from list of URLs.');
    for (const url of url_list) {
      console.log(`URL #${url_list.indexOf(url) + 1}:`);
      path_list.push(await this.download_from_url(url));
    }
    console.log('-------------------------------');
    return path_list;
  }

  /**
   * Resizes the given image by a given factor.
   * @param {String} filename - path to the file to be resized, such as
   * './folder/name.format' or 'folder/name.format'.
   * @param {int} factor - resizing factor. A factor 3 will return an image
   * with triple the width and height, making the area 9 times bigger (that
   * is, 3^2 times bigger).
   */
  resize_img(filename, factor = 1) {
    console.log('Resizing image...');
    const image = sharp(fs.readFileSync(filename));

    // metadata is used to resize based on the original width and height
    image
      .metadata()
      .then((metadata) => {
        return image
          .resize(Math.round(metadata.width / factor))
          .webp()
          .toBuffer();
      })
      .then((data) => {
        fs.writeFileSync(filename, data);
      });
  }

}

module.exports = Scraper;