const axios = require('axios'); // Promise based HTTP client for the browser and node.js
const cheerio = require('cheerio'); // Fast, flexible, and lean implementation of core jQuery designed specifically for the server.

const bodyParser = require('body-parser'); // Node.js body parsing middleware.
const cors = require('cors'); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

const express = require('express');
const service = require('./service');

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Confirms that the server is running
app.listen(port, () => {
  console.log(`RequestData app is listening on port ${port}`);
});

//deals with http GET request to the endpoint /api/scrape
//extract the search keywords using request.query
app.get('/api/scrape', async (req, res) => {
  let keyword = req.query.keyword;
  console.log('/api/scrape/keyword: ' + keyword);
  lista = await service.searchAndExtractFromWeb(keyword);
  res.send(lista);
});
