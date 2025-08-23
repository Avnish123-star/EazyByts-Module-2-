const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  addStockToPortfolio,
  removeStockFromPortfolio,
} = require('../controllers/portfolioController.js');
const { protect } = require('../middleware/authMiddleware.js');

// `protect` middleware in routes ko secure karega
router.route('/').get(protect, getPortfolio);
router.route('/add').post(protect, addStockToPortfolio);
router.route('/:id').delete(protect, removeStockFromPortfolio);

module.exports = router;