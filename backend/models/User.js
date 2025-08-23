// models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Har user ka email alag hona chahiye
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // 'createdAt' aur 'updatedAt' fields automatically ban jayengi
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;