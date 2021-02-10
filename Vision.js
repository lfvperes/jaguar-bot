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
   * @param {.js file} config - the file containing the API Keys
   * @param {object} results - the object containing the paths for storing results
   */
  constructor(config, results) {

    // defining search parameters and keys
    this.key = config.key1;            // subscription key
    this.host = config.endpoint;       // base bing path
    this.path = '/vision/v3.1/analyze';// specifying type of search
    this.loc = config.location;
    this.vis_feat = 'Tags';
    this.lang = 'en';

    this.client = new ComputerVisionClient(
      new ApiKeyCredentials({
        inHeader: { 'Ocp-Apim-Subscription-Key': this.key }
      }), this.host
    );

    // where to store results
    this.full_results = results.full;
    this.url_results = results.url;

  }

  /**
   * Uses MS Cognitive Services Computer Vision API to analyze
   * the image in the provided URL and return metadata, including
   * tags and confidence, and other visual features.
   * @param {*} name - description
   * @param {*} name - description
   * @param {*} name - description
   */
  async analyze(vis_feat = this.vis_feat, URL, show) {

    const tagsURL = 'https://www.jacadatravel.com/wp-content/uploads/2016/08/pantanal-jaguar-1024x576.jpg';
    // Analyze URL image
    console.log(`Analyzing image from the URL: ${URL}`);
    const tags = (await this.client.analyzeImage(URL, { visualFeatures: [vis_feat] })).tags;
    
    if (show) console.log(tags);
    
    var jaguar;
    tags.forEach((tag) => {
      if (tag.name == 'jaguar') {
        jaguar = tag;
      } else if (!jaguar) {
        jaguar = {confidence: 0};
      }
    });
    console.log(`I'm ${(jaguar.confidence * 100).toFixed(1)}% sure this is a jaguar!`);
    // tags.forEach((tag) => {console.log(tag.name)});
    

  }
}

module.exports = Vision;