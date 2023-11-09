const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const express = require('express');
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// let listOfProducts = [];
// fs.readFile('result.html', 'utf8', function (err, data) {
//   listOfProducts = extractListOfProducts(data);
//   console.log(listOfProducts);
// });

app.get('/api/scrape', async (req, res) => {
  let keyword = req.query.keyword;
  console.log('keyword: ' + keyword);
  lista = await searchAndExtractFromWeb(keyword);
  console.log(lista);
  res.send(lista);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// let result = getHTML('https://www.amazon.com/s?k=harry+potter').then(
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
  let searchText = null;
  let textFromMultipleColumns = searchAndExtractInnerText(
    htmlCode,
    '<span class="a-size-base-plus a-color-base a-text-normal">',
    '</span>'
  );
  let textFromSingleColumn = searchAndExtractInnerText(
    htmlCode,
    '<span class="a-size-medium a-color-base a-text-normal">',
    '</span>'
  );
  // console.log('textFromMultipleColumns: ' + textFromMultipleColumns);
  // console.log('textFromSingleColumn: ' + textFromSingleColumn);
  if (textFromMultipleColumns != null) {
    searchText = textFromMultipleColumns;
  }
  if (textFromSingleColumn != null) {
    searchText = textFromSingleColumn;
  }
  if (searchText == null) {
    return null;
  }
  // console.log('searchText: ' + searchText);

  return removeUnnecessaryWhiteSpaces(searchText.replace(/\n/g, ''));
}

function searchProductReviewStars(htmlCode) {
  let textSearchResult = searchAndExtractInnerText(
    htmlCode,
    '<span class="a-icon-alt">',
    '</span>'
  );
  if (textSearchResult == null) {
    return null;
  }
  return removeUnnecessaryWhiteSpaces(textSearchResult.replace(/\n/g, ''));
}

function searchProductNumberOfReviews(htmlCode) {
  let textSearchResult = searchAndExtractInnerText(
    htmlCode,
    '<span class="a-size-base s-underline-text">',
    '</span>'
  );
  if (textSearchResult == null) {
    return null;
  }
  return Number(textSearchResult.replace(',', ''));
}

function searchProductImageUrl(htmlCode) {
  return searchAndExtractInnerText(htmlCode, '<img class="s-image" src="', '"');
}

function extractListOfProducts(htmlCode) {
  let _listOfProducts = [];
  // console.log('**********************************************************');

  let $ = cheerio.load(htmlCode);

  // console.log($('div[data-asin]'));

  $('div[data-asin]').each(function (i, elem) {
    if ($(this).attr('data-asin') != '') {
      let atributo = $(this).attr('data-asin');
      // console.log('atributo.attribs ' + atributo.attribs);
      if (atributo.attribs == undefined) {
        // console.log(atributo);
        let _product = {
          name: '',
          stars: '',
          reviews: 0,
          imageUrl: '',
        };

        let htmlCode = cheerio.load($(this).html()).html();
        let __productName = searchProductName(htmlCode);
        if (__productName != null) {
          _product.name = __productName;
          _product.stars = searchProductReviewStars(htmlCode);
          _product.reviews = searchProductNumberOfReviews(htmlCode);
          _product.imageUrl = searchProductImageUrl(htmlCode);
          _listOfProducts.push(_product);
        }
      }
    }
  });
  return _listOfProducts;
}

async function searchAndExtractFromWeb(keyword) {
  keyword = keyword.replace(' ', '+');
  let url = 'https://www.amazon.com/s?k=' + keyword;
  let lista;

  let result = await getHTML(url).then(async (htmlCode) => {
    return await extractListOfProducts(htmlCode);
  });
  return result;
}
