const express = require('express');
const axios = require('axios');
const router = express.Router();

// @desc    Fetch live stock data for a given symbol
// @route   GET /api/stocks/:symbol
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data['Global Quote'];

    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({ message: 'Stock data not found for symbol' });
    }

    // We are only sending the data we need to the frontend
    const priceData = {
      symbol: data['01. symbol'],
      price: data['05. price'],
      changePercent: data['10. change percent'],
    };
    res.json(priceData);

  } catch (error) {
    console.error('Alpha Vantage API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch stock data' });
  }
});

// --- NEW ROUTE ADDED BELOW ---

// @desc    Fetch historical daily data for a stock
// @route   GET /api/stocks/history/:symbol
router.get('/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  // Using TIME_SERIES_DAILY to get historical data
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
      return res.status(404).json({ message: 'Historical data not found' });
    }

    // We'll format the data for Chart.js (labels and data points)
    const labels = Object.keys(timeSeries).slice(0, 100).reverse(); // Last 100 days
    const chartData = labels.map(label => timeSeries[label]['4. close']);

    res.json({ labels, chartData });

  } catch (error) {
    console.error('Alpha Vantage history API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch historical data' });
  }
});


module.exports = router;