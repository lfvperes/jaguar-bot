'use strict';
const http = require('https');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const xml2js = require('xml2js');
require('dotenv').config();

class Storage {
  constructor(default_container='jaguar-container') {
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

    this.xml_response = './data/xml_response.json';
    this.default_container = default_container;
    this.dataset_size = 30;    // default amount of blobs
  }

  /**
   * Generates an authorization signature using HMAC SHA 256.
   * @param {String} VERB - Request method to be used (GET, PUT).
   * @param {String} strTime - Time of the request, in RFC 1123 Format.
   * @param {String} uri - Path of the URL, containing the name of the
   * container and the query parameters.
   * @param {Object} content - ...
   * @param {String} content_type - ...
   * @param {boolean} blob - To check if the method will handle blobs 
   * (true) or containers (false)
   */
  create_signature(VERB, strTime, uri, content='', content_type='', blob=true) {
    VERB = VERB.toUpperCase();

    // removing first slash
    uri = uri.replace("/","");
    
    // separating '/container/blob?q2=query&q1=query' into 'container/blob' and 'q2=query&q1=query'
    var [path, queries] = uri.split("?");
    // sorting queries lexicographically and adding "\n" into 'q1=query\nq2=query'
    queries = queries ? queries.split("&").sort().join("\n") : '';
    // changing 'q1=query\nq2=query' to 'q1:query\nq2:query' if '?' was included
    queries = queries ? queries.replace(/\=/g,":") : '';
    // without the '?' char the separation is '/container/blob' and ''
    
    // const content_type = '';
    var content_length = content ? content.length.toString() : '';
    var headers = `x-ms-date:${strTime}` + "\n" + `x-ms-version:${this.version}` + "\n";
    var resource = `/${this.account_name}/${path}`;

    switch (VERB) {
      case 'GET':
        content_length = '';
        content_type = '';
        // resource += '\ncomp:list\nrestype:container';
        if(queries) resource += '\n' + queries;
        break;
      case 'PUT':
        if (blob) {
          headers = `x-ms-blob-type:BlockBlob` + "\n" + headers;
        } else {
          resource += "\n" + queries;
        }
        break;
      case 'DELETE':
        if (blob) {
          content_length = '';
          content_type = '';
        } else {
          resource += "\n" + queries;
        }
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
    console.log('-------------------------------');

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
  res_handler = function (res, context) {

    let body = '';
    // storing body
    res.on('data', (dat) => {
      body += dat;             // GET
      // process.stdout.write(dat);  // PUT, POST
    });

    // when signaling 'end' flag
    res.on('end', () => {
      // parsing response
      if (!res.complete) {
        console.error('The connection was terminated while the message was still being sent');
      } else {
        console.log(`Status: ${res.statusCode} - ${res.statusMessage}`);
        if (body) {
          // parsing XML response into JSON format
          xml2js.parseString(body, (err, result) => {
            // saving result in a JSON file
            fs.writeFileSync(context.xml_response, JSON.stringify(result), 
              (err) => {
                console.log('Error: ' + err.message);
              });
          });
        }
      }
      if (res.statusCode != '200') console.log('Response: ' + body);
      
      console.log('-------------------------------');
    });

    // handling errors
    res.on('error', (err) => {
      console.error(`Error ${err.statusCode}: ${err.statusMessage}`);
      console.error(err);
      // res.req.destroy();
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
  get_container_props(container_name=this.default_container) {
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
   * Uploads a blob with the given name, to the container with the given name.
   * @param {String} container_name - Name of the container to which the new
   * blob will be uploaded. If none is given, uses the default name.
   * @param {String} filename - Name of the new blob to be uploaded.
   */
  put_blob(container_name=this.default_container, filename, blob_name='') {
    // if no blob name is provided, will use the name of the file (without the folders and path)
    if (!blob_name) blob_name = filename.split(/\/(?=\w+[.])/)[1];
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

    console.log(`Uploading ${blob_name} to ${container_name}...`);
    let req = http.request(req_params, this.res_handler);
    req.write(obj);
    req.end();
  }

  /**
   * Given the container name and blob name, deletes the blob.
   * @param {String} container_name 
   * @param {String} blob_name 
   */
  delete_blob(container_name=this.default_container, blob_name='exemplo.jpg') {
    const time_UTC_str = new Date().toUTCString();
    var path = `/${container_name}/${blob_name}`;

    const signature = this.create_signature('DELETE', time_UTC_str, path);

    const req_params = {
      method: 'DELETE',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version,
      }
    }

    console.log(`Deleting ${blob_name} from container ${container_name}...`);
    let req = http.request(req_params, this.res_handler);
    req.end();
  }

  /**
   * Download a blob from the specified container with the specified name.
   * @param {String} container_name - The name of the container within which the
   * blob is stored.
   * @param {String} blob_name - The name of the blob to be downloaded.
   * @param {String} filename - The name of the file where the blob will be saved.
   */
  get_blob(container_name=this.default_container, blob_name, filename) {
    const time_UTC_str = new Date().toUTCString();
    var path = `/${container_name}/${blob_name}`;

    const signature = this.create_signature('GET', time_UTC_str, path);

    const req_params = {
      method: 'GET',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version,
      }
    }

    console.log(`Downloading ${blob_name} from container ${container_name}...`);
    let req = http.request(req_params, (res) => {
      
      let body = '';
      // storing body
      res.on('data', (dat) => {
        body += dat;             // GET
        // process.stdout.write(dat);  // PUT, POST
      });

      // when signaling 'end' flag
      res.on('end', () => {
        // parsing response
        if (!res.complete) {
          console.error('The connection was terminated while the message was still being sent');
        } else {
          console.log(`Status: ${res.statusCode} - ${res.statusMessage}`);
          if (body) {
            if(!filename) filename = blob_name;
            fs.writeFileSync(filename, body, 
              (err) => {
                console.log('Error: ' + err.message);
              });
          }
        }
        
        if (res.statusCode != '200') console.log('Response: ' + body);
        
        console.log('-------------------------------');
      });

      // handling errors
      res.on('error', (err) => {
        console.error(`Error ${err.statusCode}: ${err.statusMessage}`);
        console.error(err);
      });
    });
    req.end();
  }

  async list_blobs(container_name=this.default_container) {
    const time_UTC_str = new Date().toUTCString();
    const path = `/${container_name}?restype=container&comp=list`;
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

    
    console.log(`Listing all blobs in ${container_name}...`);
    let req = http.request(req_params, (res) => {
      // passing context to call functions inside callback
      this.res_handler(res, this);
    });
    req.end();   
  }

  list_blob_time() {
    const full_response = JSON.parse(fs.readFileSync(this.xml_response));
    const blob_list = full_response.EnumerationResults.Blobs[0].Blob;
    const blobs = [];
    if(blob_list) {
      for (const blob of blob_list) {
        // console.log(blob.Name[0]);
        // console.log(blob.Properties[0]['Last-Modified'][0]);
        blobs.push({
          name: blob.Name[0],
          date: new Date(blob.Properties[0]['Last-Modified'][0]),
          size: (parseInt(blob.Properties[0]['Content-Length'][0])/1024).toFixed(1) // size in KB
        });
      }
    } else {
      console.log('There are no blobs.');
    }
    return blobs;
  }

  /**
   * Creates a new container with the given name.
   * @param {String} container_name - Name of the new container to be created.
   */
  create_container(container_name) {
    const time_UTC_str = new Date().toUTCString();
    var path = `/${container_name}?restype=container`;

    const signature = this.create_signature('PUT', time_UTC_str, path, '', '', false);

    const req_params = {
      method: 'PUT',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version
      }
    }

    
    console.log(`Creating the container ${container_name}...`);
    let req = http.request(req_params, this.res_handler);
    req.end();
  }

  /**
   * Deletes a container with the given name.
   * @param {String} container_name - Name of the container to be deleted.
   */
  delete_container(container_name) {
    const time_UTC_str = new Date().toUTCString();
    var path = `/${container_name}?restype=container`;

    const signature = this.create_signature('DELETE', time_UTC_str, path, '', '', false);

    const req_params = {
      method: 'DELETE',
      hostname: this.hostname,
      path: path,
      headers: {
        'Authorization': signature,
        'x-ms-date': time_UTC_str,
        'x-ms-version': this.version,
      }
    }

    console.log(`Deleting the container ${container_name}...`);
    let req = http.request(req_params, this.res_handler);
    req.end();
  }
}

module.exports = Storage;