const { google } = require('googleapis');
const g = require('./google_keys');
const https = require('https');
const fs = require('fs');

// search parameters from the Custom Search Engine API
var key = g.key;
var cx = g.cx;
var q = 'jaguar';
var search_type = 'image';

// uri for the request
var base_uri = 'https://www.googleapis.com/customsearch/v1?key=';
var uri = base_uri + key + '&cx=' + cx + '&q=' + q + '&searchType=' + search_type;

function get_images() {
  // requesting search
  var req = https.get(uri, search);

  req.on('error', function (e) {
    // handling errors
    console.log('ERROR: ' + e.message);
  });
}

function search(res) {
  // confirm success
  console.log('STATUS: ' + res.statusCode);

  var bodyChunks = [];
  res.on(
    'data',
    (chunk) => {
      bodyChunks.push(chunk);
    }
  ).on(
    'end',
    () => {
      var body = Buffer.concat(bodyChunks);
      //console.log('BODY: ' + body);
      // save results on external files
      save_results(body);
    }
  );
}

function save_results(obj) {
  // saving body in a file and isolating all the image links in another
  image_links = JSON.parse(obj).items.map(
    (item) => { return item.link; }
  );
  fs.writeFileSync('full_results.json', obj);
  fs.writeFileSync('image_links.json', JSON.stringify(image_links));
}

exports.get_images = get_images;