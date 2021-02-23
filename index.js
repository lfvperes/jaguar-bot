const Bot = require('./classes/Bot');


const bot = new Bot();

setTimeout(() => {
    bot.twitter.tweet_game();
}, 3 * 60000);
// bot.scraper.bing_img_search('jaguar');
// bot.storage.put_blob('jaguar-container', './data/img/image1613269207461.jpg');
// bot.storage.delete_blob('jaguar-container', './data/img,image1613269207461.jpg');

// bot.filter_url();
// bot.scraper.bing_img_search('jaguar', 5);
// bot.filter_url(3);
// bot.update_blob();
// bot.scraper.download_from_url('http://www.awsfzoo.com/media/IMG_9141-1-1.jpg');



// bot.vision.get_tags('https://upload.wikimedia.org/wikipedia/commons/9/94/Jaguar_sitting-edit1.jpg');
// bot.vision.analyze_from_url('https://upload.wikimedia.org/wikipedia/commons/9/94/Jaguar_sitting-edit1.jpg')
// .then(
//     val => { console.log(val) }
// );