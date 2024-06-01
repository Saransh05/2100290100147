const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = 9876;

const windowSize = 10;
const window = [];

const thirdPartyAPIs = {
  p: 'http://20.244.56.144/test/primes',
  f: 'http://20.244.56.144/test/fibo',
  e: 'http://20.244.56.144/test/even',
  r: 'http://20.244.56.144/test/rand',
};

const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MjIxNjUyLCJpYXQiOjE3MTcyMjEzNTIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImM3MzQ3YjY3LWMwMmYtNGM3Ny05OTZjLTRlNDRkYzk0MDQxNSIsInN1YiI6InNhcmFuc2gyMjAxQGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6IkFmZm9yZE1lZCIsImNsaWVudElEIjoiYzczNDdiNjctYzAyZi00Yzc3LTk5NmMtNGU0NGRjOTQwNDE1IiwiY2xpZW50U2VjcmV0IjoiUkZvYlRjRU5uaFlraGFDbSIsIm93bmVyTmFtZSI6IlNhcmFuc2giLCJvd25lckVtYWlsIjoic2FyYW5zaDIyMDFAZ21haWwuY29tIiwicm9sbE5vIjoiMjEwMDI5MDEwMDE0NyJ9.k2zg-67XtdoyXYxuaxYJKS-M-CdVtUrP4pZX4aB4vfI";

app.get('/numbers/:numberid', async (req, res) => {
  const numberID = req.params.numberid;
  const apiUrl = thirdPartyAPIs[numberID];

  if (!apiUrl) {
    return res.status(400).send({ error: 'Invalid number ID' });
  }

  const prevWindowState = [...window];

  try {
    const config = {};
    if (numberID === 'p') {
      config.headers = { Authorization: `Bearer ${bearerToken}` };
    }
    
    const response = await axios.get(apiUrl, { ...config, timeout: 500 });
    const numbers = response.data.numbers;

    // Ensure uniqueness and manage window size
    const uniqueNumbers = _.uniq([...window, ...numbers]);
    while (uniqueNumbers.length > windowSize) {
      uniqueNumbers.shift();
    }

    window.length = 0; 
    window.push(...uniqueNumbers); 

    const avg = _.mean(window);

    const responsePayload = {
      windowPrevState: prevWindowState,
      windowCurrState: window,
      numbers,
      avg: parseFloat(avg.toFixed(2)),
    };

    res.json(responsePayload);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send({ error: 'Error fetching data from third-party API' });
  }
});

app.listen(port, () => {
  console.log(`Average Calculator microservice running on port ${port}`);
});
