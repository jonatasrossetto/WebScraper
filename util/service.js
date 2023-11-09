const axios = require('axios'); // Promise based HTTP client for the browser and node.js
const cheerio = require('cheerio'); // Fast, flexible, and lean implementation of core jQuery designed specifically for the server.

// Get the HTML code from the given URL
// returns a string
async function getHTML(URL) {
  try {
    const { data: html } = await axios
      .get(URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
        },
      })
      .catch(function (error) {
        console.log('Error: ' + error);
      });
    return html;
  } catch (error) {
    console.error('Error: ' + error);
    return null;
  }
}

// Remove the unnecessary white spaces inside text string
// Returns a string
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

// Search into text string for the sub-text between the strings beginDelimiter and endDelimiter
// returns a string
function searchAndExtractInnerText(text, beginDelimiter, endDelimiter) {
  let beginIndex = text.indexOf(beginDelimiter);
  if (beginIndex < 0) return null;
  beginIndex += beginDelimiter.length;
  let endIndex =
    beginIndex + text.substring(beginIndex, text.length).indexOf(endDelimiter);
  return text.substring(beginIndex, endIndex);
}

//
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

  if (htmlCode == null) {
    return null;
  }

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
    // console.log(htmlCode);
    return await extractListOfProducts(htmlCode);
  });
  return result;
}

export function searchAndExtractFromWeb();