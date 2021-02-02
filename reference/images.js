var imgDl = require('image-downloader'),
    fs = require('fs');                                                    

function download_from(filename) {
  // parameters to read the file
  var links = [];
  options = {
    encoding: 'utf8',
    flag: 'r'
  };
  // reading urls from file
  var data = fs.readFileSync(filename, options);
  JSON.parse(data).map((link) => {
    // storing urls on variable
    links.push(link);
  });
  // download images from the saved urls
  download(links);
}
/*

  fs.readFile(filename, (err, data) => {
    if (err) throw err;
    //console.log(JSON.parse(data));
    JSON.parse(data).map((link) => {
      links.push(link);
    });
    download(links);
  });
  */


function download(urls) {
  let N = Math.floor(Math.random() * (urls.length - 1));
  console.log('Downloading from ' + urls[N] + ', the element #' + (N + 1));
  const options = {
    url: urls[N],
    dest: './img/image.jpg'
  };

  imgDl.image(options)
    .then(({ filename }) => {
      console.log('Saved to', filename)  // saved to /path/to/dest/photo
    })
    .catch((err) => console.error(err));
}

exports.download_from = download_from;