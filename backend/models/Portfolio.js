const mongoose = require('mongoose');

const portfolioSchema = mongoose.Schema(
  {
    // Yeh batayega ki yeh stock kis user ka hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // User model se connection
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true, // Stock symbol hamesha capital mein save hoga (jaise 'RELIANCE')
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;