const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ServiceSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  slug: String,

  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },

  price: {
    type: Number,
  },

  details: {
    type: String,
    trim: true,
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

ServiceSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

ServiceSchema.pre("update", function (next) {
  this.updateAt = Date.now;
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model("Service", ServiceSchema);
