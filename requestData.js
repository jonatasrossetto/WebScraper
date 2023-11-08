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
  let $ = cheerio.load(data);

  let _listOfProductIds = [];
  $('div[data-asin]').each(function (i, elem) {
    _listOfProductIds.push($(this).attr('data-asin'));
  });

  let _listOfProductDivs = [];
  let _listOfRawProductNames = [];
  let _listOfProductStars = [];

  $('div[data-asin]').each(function (i, elem) {
    _listOfProductDivs.push($(this).html());

    let $$ = cheerio.load($(this).html());
    let beginIndex = $$.html().indexOf(
      '<span class="a-size-base-plus a-color-base a-text-normal">'
    );
    if (beginIndex > 0) {
      beginIndex += 58;
      let endIndex =
        beginIndex +
        $$.html().substring(beginIndex, $$.html().length).indexOf('</span>');
      let rawProductName = $$.html()
        .substring(beginIndex, endIndex)
        .replace(/\n/g, '');
      _listOfRawProductNames.push(removeUnnecessaryWhiteSpaces(rawProductName));
      //   console.log(`[${i}]: ${rawProductName}`);

      let productStars = searchAndExtractInnerText(
        $$.html(),
        '<span class="a-icon-alt">',
        '</span>'
      );
      _listOfProductStars.push(
        removeUnnecessaryWhiteSpaces(productStars.replace(/\n/g, ''))
      );
    }
  });

  //   console.log(_listOfProductDivs[1]);
  //   console.log(_listOfRawProductNames);
  console.log(_listOfProductStars);
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

function removeBeginingWhiteSpace(text) {
  let beginIndex = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] != ' ') {
      beginIndex = i;
      break;
    }
  }
  return text.substring(beginIndex, text.length);
}

function removeEndWhiteSpace(text) {
  let endIndex = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] != ' ') {
      endIndex = i;
      break;
    }
  }
  return text.substring(0, endIndex + 1);
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
