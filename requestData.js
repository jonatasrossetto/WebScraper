const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// let result = getHTML('https://www.amazon.com/s?k=nespresso+maker').then(
//   (result) => {
//     console.log(result);
//     var createStream = fs.createWriteStream('result.html');
//     createStream.end();
//     var writeStream = fs.createWriteStream('result.html');
//     writeStream.write(result);
//     writeStream.end();
//   }
// );

fs.readFile('result.html', 'utf8', function (err, data) {
  var $ = cheerio.load(data);
  var _listOfProductIds = [];
  $('div[data-asin]').each(function (i, elem) {
    _listOfProductIds.push($(this).attr('data-asin'));
  });
  var _listOfProductDivs = [];
  $('div[data-asin]').each(function (i, elem) {
    _listOfProductDivs.push($(this).html());
    let $$ = cheerio.load($(this).html());
    let beginIndex = $$.html().indexOf(
      '<span class="a-size-base-plus a-color-base a-text-normal">'
    );
    if (beginIndex > 0) {
      let endIndex =
        beginIndex +
        58 +
        $$.html()
          .substring(beginIndex + 58, $$.html().length)
          .indexOf('</span>');
      //   console.log(inicio, fim);
      let rawProductName = $$.html().substring(beginIndex + 58, endIndex);
      console.log(rawProductName);
    }
  });
  //   console.log(_listOfProductDivs[1]);
  _listOfProductDivs;
});

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
