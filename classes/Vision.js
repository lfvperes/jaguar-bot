'use strict';
const fs = require('fs');
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
/**
 * Responsible for analyzing images using the
 * Microsoft Cognitive Services Computer Vision API.
 */
class Vision {
  /**
   * @constructor
   * @param {object} config - The exported file containing the API Keys.
   * @param {string} results - The path for the file where the results
   * will be stored.
   */
  constructor(config, results) {

    // defining search parameters and keys
    this.key = config.key1;            // subscription key
    this.host = config.endpoint;       // base bing path
    this.path = '/vision/v3.1/analyze';// specifying type of search
    this.loc = config.location;
    this.vis_feat = 'Tags';           // default visual features
    this.lang = 'en';

    this.client = new ComputerVisionClient(
      new ApiKeyCredentials({
        inHeader: { 'Ocp-Apim-Subscription-Key': this.key }
      }), this.host
    );

    // where to store results
    this.full_results = results.full;
    this.url_results = results.url;

    // keywords to analyze the tags
    this.cat_keywords = [
      'animal',
      'mammal',
      'carnivore',
      'cat',
      'felidae'
    ];
    this.car_keywords = [
      'road',
      'car',
      'automotive',
      'vehicle',
      'supercar',
      'street',
      'highway'
    ];
  }

  /**
   * Uses MS Cognitive Services Computer Vision API to analyze
   * the image in the provided URL and return metadata, including
   * tags and confidence, and other visual features.
   * @param {string} URL - The URL of the image to be analyzed by the API.
   * @param {boolean} show - Whether the tags should be printed on the
   * console or not. Default is 'true'.
   * @param {string} vis_feat - Visual Features: Attributes to be received
   * back in the response body. Default is 'Tags', but other features can
   * be passed as well.
   */
  async get_tags(URL, show=true, vis_feat = this.vis_feat) {
    console.log(`Analyzing image from the URL: ${URL}`);
    // Analyze URL image
    const result = await this.client.analyzeImage(URL, { visualFeatures: [vis_feat] })
    .catch((err) => { // handling errors
      console.log(err.body.message);
    });
    // if the request was successful, an object will be received
    if (result) {
      // extract the tags from the object
      var tags = result.tags;
    } else {
      // return nothing if there was an error
      return;
    }
    
    // showing tags
    if (show) console.log(tags);
    
    return tags;
  }

  open_list(path) {
    return JSON.parse(fs.readFileSync(path));
  }

  /**
   * Receives an array of tags and determines a score based on the
   * confidence of each tag, comparing their names with keywords.
   * If the score is negative, the object in the picture is more
   * likely a 'car' jaguar; if it's positive, a 'cat' jaguar.
   * @param {Array} tags - Array containing objects with attributes
   * 'name', 'confidence' and 'hint'.
   */
  analyze_tags(tags) {
    var score = 0;
    const answers = [
      "Probably a big fluffy cat.",   // score > 0
      "Meh just another stupid car.", // score < 0
      "I don't know what this is."    // score == 0
    ];
    // check if an array of tags was received
    if (tags) {
      // compare each tag with all keywords
      tags.forEach((tag) => {
        this.cat_keywords.forEach(word => {
          // increment the score positively with the confidence for the tag
          score += tag.name.includes(word) ? tag.confidence : 0;
        });
        this.car_keywords.forEach(word => {
          // increment the score negatively with the confidence for the tag
          score += tag.name.includes(word) ? -1 * tag.confidence : 0;
        });
      });
      console.log(`Score: ${score}`);
      console.log(score > 0 ? answers[0] : score < 0 ? answers [1] : answers[2]);
    } else {  // do nothing if there were no tags (due to some error)
      console.log('There are no tags.');
    }
    console.log('-------------------------------');
    return score;
  }

  filter(url_list) {
    // iterate list
    // get tags 
    // analyze tags
    // change from unfiltered to selected or rejected based on tags
  }
}

module.exports = Vision;