const puppeteer = require('puppeteer');

function rnd_time() {
  let time = Math.floor(Math.random() * 1000);
  return time;
}

async function get_img_urls(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // array to store urls
  var url_list = [];

  
  // the xpath to select the focused image is always the same as long as it is selected
  const inner_xpath = '/html/body/div[1]/div/div/div[1]/div/div[1]/div[1]/div[1]/div/div/div/img';

  // loop through many search result images
  for (let idx = 2; idx < 15; idx++) {
    
    // search page (yes I used Bing)
    await page.goto(`https://www.bing.com/images/search?q=${query}`);

    await page.waitForTimeout(rnd_time());    // random time between actions

    // selecting individual thumbnails in the page
    var selector = `li[data-idx='${idx}']`;
    /*var thumbnail = await page.$$(selector);
    await page.waitForTimeout(rnd_time());

    // click the selected thumbnail to open the image
    await thumbnail[0].click();*/

    await page.click(selector);
    await page.waitForTimeout(rnd_time());    

    // waiting for iframe to be ready
    await page.waitForSelector('iframe');
    
    await page.waitForTimeout(rnd_time());

    // selecting correct iframe by its id
    var elementHandle = await page.$(
      'iframe#OverlayIFrame',
    );

    await page.waitForTimeout(rnd_time());

    // loading iframe content
    var frame = await elementHandle.contentFrame();

      
    await page.waitForTimeout(rnd_time());

    // selecting intended image (not the thumbnail)
    var full_img = await frame.$x(inner_xpath);
    
    await page.waitForTimeout(rnd_time());

    // get url for the original-sized image
    var img_url = await frame.evaluate((elem) => {
      return elem.src;
    }, full_img[0]);
    
    await page.waitForTimeout(rnd_time());
    // back to search page
    await page.keyboard.press('Escape');
    
    await page.waitForTimeout(rnd_time());

    url_list.push(img_url);
    console.log(`Image #${idx}: ${img_url}`);

    await page.waitForTimeout(rnd_time());
  }
  
  await browser.close();

  return url_list;
}

(async() => {
  const URLs = await get_img_urls('jaguar')
  .then((res) => {
    if ((new Set(res)).size !== res.length) {
      console.log('Há URLs duplicados.')
    }
  });
  console.log(URLs);
  
})().then(console.log('fimmm'));

