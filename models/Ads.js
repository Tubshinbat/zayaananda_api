const mongoose = require("mongoose");

const AdsSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Зарлалын гарчиг оруулна уу"],
  },

  details: {
    type: String,
    trim: true,
    required: [true, "Зарлалын дэлгэрэнгүй оруулна уу"],
  },

  pictures: {
    type: [String],
  },

  views: {
    type: Number,
    default: 0,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Ads", AdsSchema);
