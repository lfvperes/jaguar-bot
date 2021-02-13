const https = require('https');
const fs = require('fs');
const imgDl = require('image-downloader');
const { type } = require('os');

/**
 * This class is responsible for searching and saving images.
 * That includes saving .JSON responses from the CSE JSON API, saving
 * the URLs provided and downloading the image files from the 
 * respective URLs.
 */
class Scraper {
    /**
     * @constructor
     * @param {.js file} config - the file containing the API keys.
     */
    constructor(config, image_links) {
        // search parameters from the Custom Search Engine API
        this.key = config.key;
        this.cx = config.cx;
        this.q = '';        // query
        this.search_type = 'image';
        this.base_uri = ''; 
        this.num = 10;      // default count
        this.start = 1;     // first result
        this.images = [];   // image URLs

        this.get_images(image_links);
    }

    /**
     * Sets the uri based the provided parameters.
     * Whenever one parameter is changed, this function must be 
     * called again.
     */
    set_uri() {
        // uri for the request
        this.base_uri = `
        https://www.googleapis.com/customsearch/v1?key=${this.key}&cx=${this.cx}&q=${this.q}&searchType=${this.search_type}&num=${this.num}&start=${this.start}
        `;
        console.log(this.base_uri);
    }

    /**
     * From a given word or phrase, makes the Get request to the
     * Custom Search Enngine.
     * @param {string} query - Term to be searched in the CSE.
     * @param {int} start - First result item to be returned (max:90).
     */
    search_images(query, start=0) {
        this.start = start;
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

    /**
     * Callback for search_images.
     * @param {*} res - response
     */
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
                this.images = JSON.parse(body).items.map(
                    (item) => { return item.link; }
                );
                fs.writeFileSync('./data/full_results.json', body);
                fs.writeFileSync('./data/image_links.json', JSON.stringify(this.images));
            }
        );
    }

    save_results(obj) {
        // saving body in a file and isolating all the image links in another
        this.images = JSON.parse(obj).items.map(
            (item) => { return item.link; }
        );
        fs.writeFileSync('./data/full_results.json', obj);
        fs.writeFileSync('./data/image_links.json', JSON.stringify(this.images));
    }

    /**
     * Reads the .JSON file containing all the URLs from the search results and
     * stores them in an array from which any of them can be downloaded.
     * @param {string} filename - Path to the file containing the image URLs.
     */
    get_images(filename) {
        // parameters to read the file
        let links = [];
        let options = {
            encoding: 'utf8',
            flag: 'r'
        };
        
        // reading urls from file
        var data = fs.readFileSync(filename, options);
        JSON.parse(data).map((link) => {
            // storing urls on variable
            links.push(link);
        });

        // storing in local variable
        this.images = links;
    }

    /**
     * Receives a URL to download an image.
     * If no arguments are passed, one URL is randomly chosen from the list.
     * If an invalid argument is passed, returns.
     * @param {string} url - URL from which the image will be downloaded.
     */
    download_from(url, img_name) {
        let chosen_url;
        let img_id = '';    // different names for each image
        
        if (!url) {     // Checking if any parameter was passed (!undefined yields true)
            // in case the URLs file was not input into the images variable, do it
            if (!this.images.length) this.get_images('./data/image_links.json');

            // defining a random number and saying which it is
            let N = Math.floor(Math.random() * (this.images.length - 1));
            console.log('Downloading from ' + this.images[N] + ', the element #' + (N + 1));

            // assigning the random URL instead of a given argument
            chosen_url = this.images[N];

        } else {        // In case an argument was passed
            if (typeof(url) === 'string') { // checking if it is a string
                chosen_url = url;
            } else {    // if it is not, then it is not a URL
                console.log('Not a valid URL');
                return;
            }
        }

        // making each file name unique
        if (!img_name) {
            let time = new Date();
            img_id = time.getTime();
        } else img_id = img_name;
        
        // parameters to the image downloader
        const options = {
            url: chosen_url,
            dest: `./data/img/image${img_id}.jpg`
        };

        // downloading image
        imgDl.image(options)
            .then(({ filename }) => {
            console.log('Saved to', filename)  // saved to /path/to/dest/photo
            })
            .catch((err) => console.error(err));
    }

}

module.exports = Scraper;