const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let listOfProducts = [];
fs.readFile('result.html', 'utf8', function (err, data) {
  listOfProducts = extractListOfProducts(data);
  console.log(listOfProducts);
});

app.get('/api/scrape', (req, res) => {
  let keyword = req.query.keyword;
  console.log('keyword: ' + keyword);
  res.send(listOfProducts);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

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

function removeUnnecessaryWhiteSpaces(text) {
  let result = '';
  let isSpace = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] == ' ') {
      if (!isSpace) {
        result += text[i];
        isSpace = true;
      }
    } else {
      result += text[i];
      isSpace = false;
    }
  }
  return result;
}

function searchAndExtractInnerText(text, beginDelimiter, endDelimiter) {
  let beginIndex = text.indexOf(beginDelimiter);
  if (beginIndex < 0) return null;
  beginIndex += beginDelimiter.length;
  let endIndex =
    beginIndex + text.substring(beginIndex, text.length).indexOf(endDelimiter);
  return text.substring(beginIndex, endIndex);
}

function searchProductName(htmlCode) {
  return removeUnnecessaryWhiteSpaces(
    searchAndExtractInnerText(
      htmlCode,
      '<span class="a-size-base-plus a-color-base a-text-normal">',
      '</span>'
    ).replace(/\n/g, '')
  );
}

function searchProductReviewStars(htmlCode) {
  return removeUnnecessaryWhiteSpaces(
    searchAndExtractInnerText(
      htmlCode,
      '<span class="a-icon-alt">',
      '</span>'
    ).replace(/\n/g, '')
  );
}

function searchProductNumberOfReviews(htmlCode) {
  return Number(
    searchAndExtractInnerText(
      htmlCode,
      '<span class="a-size-base s-underline-text">',
      '</span>'
    ).replace(',', '')
  );
}

function searchProductImageUrl(htmlCode) {
  return searchAndExtractInnerText(htmlCode, '<img class="s-image" src="', '"');
}

function extractListOfProducts(htmlCode) {
  let _listOfProducts = [];
  let $ = cheerio.load(htmlCode);

  $('div[data-asin]').each(function (i, elem) {
    if ($(this).attr('data-asin') != '') {
      let _product = {
        name: '',
        stars: '',
        reviews: 0,
        imageUrl: '',
      };

      let htmlCode = cheerio.load($(this).html()).html();

      _product.name = searchProductName(htmlCode);

      _product.stars = searchProductReviewStars(htmlCode);

      _product.reviews = searchProductNumberOfReviews(htmlCode);

      _product.imageUrl = searchProductImageUrl(htmlCode);

      _listOfProducts.push(_product);
    }
  });
  return _listOfProducts;
}
