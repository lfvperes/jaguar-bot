var imgDl = require('image-downloader'),
    fs = require('fs');                                                    

function download_from(filename) {
  // reading links from file
  var links = [];
  options = {
    encoding: 'utf8',
    flag: 'r'
  };
  var data = fs.readFileSync(filename, options);
  JSON.parse(data).map((link) => {
    links.push(link);
  });
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
  let N = Math.floor(Math.random() * urls.length);
  console.log('Downloading from ' + urls[N] + ', the element #' + N);
  var ext = urls[N].slice(-3);
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