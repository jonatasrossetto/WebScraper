const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

let result = getHTML('https://www.amazon.com/s?k=nespresso+maker').then(
  (result) => {
    console.log(result);
    var createStream = fs.createWriteStream('result.html');
    createStream.end();
    var writeStream = fs.createWriteStream('result.html');
    writeStream.write(result);
    writeStream.end();
  }
);

async function getHTML(productURL) {
  const { data: html } = await axios
    .get(productURL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
      },
    })
    .catch(function (error) {
      console.log(error);
    });
  return html;
}
