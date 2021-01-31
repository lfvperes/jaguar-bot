const https = require('https');
const fs = require('fs');

class Crawler {
    constructor(config) {
        // search parameters from the Custom Search Engine API
        this.key = config.key;
        this.cx = config.cx;
        this.q = '';
        this.search_type = 'image';
        this.base_uri = ''; 
    }

    set_uri() {
        // uri for the request
        this.base_uri = `
        https://www.googleapis.com/customsearch/v1?key=\
        ${this.key}&cx=${this.cx}&q=${this.q}&searchType=${this.search_type}
        `;
    }

    get_images(query) {
        // updating query and uri
        this.q = query;
        this.set_uri();
        // requesting search
        var req = https.get(this.base_uri, this.search);

        req.on('error', function (e) {
            // handling errors
            console.log('ERROR: ' + e.message);
        });
    }

    // callback for get_images
    search(res) {
        console.log('Searching for images');
        // confirm success
        console.log('STATUS: ' + res.statusCode);

        var bodyChunks = [];
        // concatenating data as json
        res.on(
            'data',
            (chunk) => {
                bodyChunks.push(chunk);
            }
        ).on(
            'end',
            () => {
                var body = Buffer.concat(bodyChunks);
                // save results on external files
                
                console.log('Saving URLs for images');
                //this.save_results(body);
                // for some reason the function does not work here
                var image_links = JSON.parse(body).items.map(
                    (item) => { return item.link; }
                );
                fs.writeFileSync('full_results.json', body);
                fs.writeFileSync('image_links.json', JSON.stringify(image_links));
            }
        );
    }

    save_results(obj) {
        // saving body in a file and isolating all the image links in another
        var image_links = JSON.parse(obj).items.map(
            (item) => { return item.link; }
        );
        fs.writeFileSync('full_results.json', obj);
        fs.writeFileSync('image_links.json', JSON.stringify(image_links));
    }

}

module.exports = Crawler;