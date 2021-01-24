var fs = require('fs');

var links = [];
fs.readFile('./image_links.json', (err, data) => {
  if (err) throw err;
  console.log(JSON.parse(data));
  JSON.parse(data).map((link) => {
    links.push(link);
  })
});