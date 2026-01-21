// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
  
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema); 