const Portfolio = require('../models/Portfolio.js');

// @desc    Get user's portfolio
// @route   GET /api/portfolio
const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user._id });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new stock to portfolio
// @route   POST /api/portfolio/add
const addStockToPortfolio = async (req, res) => {
  const { symbol, quantity, purchasePrice } = req.body;

  try {
    const newStock = new Portfolio({
      user: req.user._id,
      symbol,
      quantity,
      purchasePrice,
    });

    const createdStock = await newStock.save();
    res.status(201).json(createdStock);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove a stock from portfolio
// @route   DELETE /api/portfolio/:id
const removeStockFromPortfolio = async (req, res) => {
  try {
    const stock = await Portfolio.findById(req.params.id);

    if (stock) {
      // Check karo ki stock usi user ka hai jo delete kar raha hai
      if (stock.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await stock.deleteOne();
      res.json({ message: 'Stock removed from portfolio' });
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPortfolio,
  addStockToPortfolio,
  removeStockFromPortfolio,
};