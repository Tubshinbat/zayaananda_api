const mongoose = require("mongoose");

const AdsBannerSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  type: {
    type: String,
    enum: ["home", "side"],
    default: "home",
  },

  picture: {
    type: String,
    required: [true, "Баннер зураг оруулна уу"],
  },

  bigPicture: {
    type: String,
  },

  link: {
    type: String,
    trim: true,
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

module.exports = mongoose.model("AdsBanner", AdsBannerSchema);
