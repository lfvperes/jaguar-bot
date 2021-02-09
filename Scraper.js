'use strict';
const https = require('https');
const fs = require('fs');

/**
 * This class is responsible for searching and saving images.
 * That includes saving results from the Bing Image Search API,
 * saving the URLs provided and downloading the image files
 * from them.
 */
class Scraper {
  /**
   * @constructor
   * @param {.js file} config - the file containing the API Keys
   * @param {object} results - the object containing the paths for storing results
   */
  constructor(config, results){

    // defining search parameters and keys
    this.key = config.key1;           // subscription key
    this.host = config.endpoint;      // base bing path
    this.path = '/v7.0/images/search';// specifying type of search
    this.query = 'tropical ocean';    // default search term
    this.count = 10;                  // default results count per search
    this.offset = 1;                  // default first result
    
    // where to store results
    this.full_results = results.full;
    this.url_results = results.url;

  }
  
  /**
   * This function is responsible for handling and parsing
   * responses, including how the search results will be 
   * processed.
   * @param {*} res - response from GET request on search
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

        console.log(`Found ${img_results.value.length} results!`);
        console.log(`First image web search url: ${fst_img_result.webSearchUrl}`);
        
        // extracting and storing URLs in array
        img_results.value.forEach((r) => {url_list.push(r.webSearchUrl);});
        // writing full results in file
        fs.writeFileSync(context.full_results, body,
         (err) => {
           console.log('Error: ' + err.message);
         });        

      } else console.log("No results");

      context.update_url_list();
    });

    // handling errors
    res.on('error', (err) => {
      console.log('Error: ' + err.message);
    });
  };

  /**
   * Performs a search using the Bing Image Search API,
   * given the search term, the amount of results and the
   * starting results. If not given, all of them will set 
   * to default.
   * @param {string} search_term - word or phrase to be searched
   * @param {int} r_count - how many results will be returned
   * @param {int} start - first result
   */
  bing_img_search(search_term=this.query, r_count=this.count, start=this.offset) {
    console.log(`Searching for ${r_count} ${search_term} images...`);

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
   * Takes the results in the JSON file, extracts URLs and save them.
   * To save the new URLs, the existing file is read for the new URLs
   * to be added to the array. The array is then saved again.
   * If the file doesn't not exist it will be created.
   * @param {string} results - parsed JSON file body containing metadata about results
   */
  update_url_list() {
    // empty array to store URLs
    var new_url_list = [];
    // call the function again after creating empty file for the first time
    var recursion = false;
    // count how many new URLs were added
    let count_new = 0;

    // checking if 'full results' file exists before opening it
    if (fs.existsSync(this.full_results)) {

      // reading file and parsing into object
      var new_results = JSON.parse(fs.readFileSync(this.full_results));
      // extracting and storing new URLs in array
      new_results.value.forEach((r) => {new_url_list.push(r.contentUrl)});
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
            !old_url_list.selected.includes(url) &&
            !old_url_list.rejected.includes(url)
          ) {
            old_url_list.unfiltered.push(url);
            count_new++;
            console.log(`#${new_url_list.indexOf(url)+1}: New URL. Saving ${url}`);
          } else {
            console.log(`#${new_url_list.indexOf(url)+1}: Duplicate URL. Skipping ${url}`);
          }
        });
        
        console.log(`Saving ${count_new} new URLs to the unfiltered list, from ${new_url_list.length} found`);

      } else {  // if the file doesn't exist, create it
        console.log(`The file ${this.url_results} does not exist`);
        console.log('Creating file (empty) now...');
        var old_url_list = {
          unfiltered: [],
          selected: [],
          rejected: []
        };

        recursion = true;
      }

      // writing URL list in file (empty if it doesn't exist, to create it)
      fs.writeFileSync(this.url_results, JSON.stringify(old_url_list));
      // if the file was created for the first time, call the function again
      if (recursion) this.update_url_list();

    } else console.log(`The file ${this.full_results} does not exist`);
    
  }


}

module.exports = Scraper;