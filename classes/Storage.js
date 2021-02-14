'use strict';
const http = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
require('dotenv').config();

class Storage {
  constructor() {
    // entering credentials
    this.account_name = process.env.ACCOUNT_NAME || "";
    this.account_key = process.env.ACCOUNT_KEY || "";
    // fixing endpoint
    this.hostname = `${this.account_name}.blob.core.windows.net`;

    this.version = '2020-04-08';

    this.content_types = {
      image: "image/jpeg",
      text: "text/plain; charset=UTF-8"
    };
  }

  /**
   * Generates an authorization signature using HMAC SHA 256.
   * @param {String} VERB - Request method to be used (GET, PUT).
   * @param {String} strTime - Time of the request, in RFC 1123 Format.
   * @param {String} uri - Path of the URL, containing the name of the
   * container and the query parameters.
   * @param {Object} content - ...
   * @param {String} content_type - ...
   */
  create_signature(VERB, strTime, uri, content='', content_type='') {
    VERB = VERB.toUpperCase();

    // removing first slash
    uri = uri.replace("/","");
    
    // separating '/container/blob?q=query&q=query' into 'container/blob' and 'q=query&q=query'
    var [path, query] = uri.split("?");
    // changing 'q=query&q=query' to 'q:query\nq:query' if '?' is included
    query = query ? query.replace(/\=/g,":").replace(/\&/g,"\n") : '';
    // without the '?' char the separation is '/container/blob' and ''
    
    // const content_type = '';
    var content_length = content ? content.length.toString() : '';
    var headers = `x-ms-date:${strTime}` + "\n" + `x-ms-version:${this.version}` + "\n";
    var resource = `/${this.account_name}/${path}`;

    switch (VERB) {
      case 'GET':
        content_length = '';
        content_type = '';
        resource += "\n" + query
        break;
      case 'PUT':
        headers = `x-ms-blob-type:BlockBlob` + "\n" + headers;
        break;
      case 'DELETE':
        break;
      default:
        break;
    }
    
    let strToSign = VERB + "\n" + // VERB
      "\n" +                      // Content-Encoding
      "\n" +                      // Content-Language
      content_length + "\n" +     // Content-Length
      "\n" +                      // Content-MD5
      content_type + "\n" +       // Content-Type
      "\n" +                      // Date
      "\n" +                      // If-Modified-Since
      "\n" +                      // If-Match
      "\n" +                      // If-None-Match
      "\n" +                      // If-Unmodified-Since
      "\n" +                      // Range
      // CanonicalizedHeaders
      headers +
      // CanonicalizedResource
      resource;

    console.log(strToSign);

    // generating secret from account key
    var secret = CryptoJS.enc.Base64.parse(this.account_key);
    // encrypting the signature
    var hash = CryptoJS.HmacSHA256(strToSign, secret);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    var auth_sig = `SharedKey ${this.account_name}:` + hashInBase64;

    return auth_sig;
  }

  /**
 * Callback function that handles and parses the responses, 
 * including how the search results will be processed.
 * @param {object} res - response from request
 */
  res_handler = function (res) {

    let body = '';
    // storing body
    res.on('data', (dat) => {
      // body += dat;             // GET
      process.stdout.write(dat);  // PUT, POST
    });

    // when signaling 'end' flag
    res.on('end', () => {
      // parsing response
      if (!res.complete) {
        console.error('The connection was terminated while the message was still being sent');
      } else {
        // console.log(res);
        console.log(`Status: ${res.statusCode} - ${res.statusMessage}`);
      }
      console.log('Response: ' + body);
      
    });

    // handling errors
    res.on('error', (err) => {
      console.error(`Error ${err.statusCode}: ${err.statusMessage}`);
      console.error(err);
      res.req.destroy();
    });

  };

  /**
   * Returns a list of all the containers in the account.
   */
  list_containers() {
    const time_UTC_str = new Date().toUTCString();
    const path = '/?comp=list';
    const signature = this.create_signature('GET', time_UTC_str, path);

    const req_params = {
      method: 'GET',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version
      }
    }

    let req = http.request(req_params, this.res_handler);
    req.end();
  }

  /**
   * Returns all user-defined metadata and system properties for the specified 
   * container.
   * @param {String} container_name - The name of the container whose metadata
   * will be retrieved.
   */
  get_container_props(container_name='jaguar-container') {
    const time_UTC_str = new Date().toUTCString();
    const path = `/${container_name}?restype=container`;
    const signature = this.create_signature('GET', time_UTC_str, path);

    const req_params = {
      method: 'GET',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version
      }
    }

    let req = http.request(req_params, this.res_handler);
    req.end();
  }

  /**
   * 
   * @param {*} container_name 
   * @param {*} filename 
   */
  put_blob(container_name='jaguar-container', filename, blob_name='exemplo.jpg') {
    const time_UTC_str = new Date().toUTCString();
    var path = `/${container_name}/${blob_name}`;

    const obj = fs.readFileSync(filename);
    const content_type = this.content_types.image;
    // const content_type = this.content_types.text;

    const signature = this.create_signature('PUT', time_UTC_str, path, obj, content_type);

    const req_params = {
      method: 'PUT',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version,
        'x-ms-blob-type': 'BlockBlob',
        'Content-Length': obj.length.toString(),
        'Content-Type': "image/jpeg",
        // 'Slug': filename
      }
    }

    let req = http.request(req_params, this.res_handler);
    req.write(obj);
    req.end();
  }
}

module.exports = Storage;
// const storage = new Storage();
// storage.list_containers();
// storage.get_container_props('jaguar-container');
// storage.put_blob('jaguar-container','foto.jpg');