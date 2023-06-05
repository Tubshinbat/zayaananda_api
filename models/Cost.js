const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const CostSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: true,
  },

  minPrice: {
    type: Number,
    requried: [true, "Доод үнэ оруулна уу"],
  },

  maxPrice: {
    type: Number,
    requried: [true, "Дээд үнэ оруулна уу"],
  },

  averagePrice: {
    type: Number,
  },

  priceNotNoat: {
    type: Number,
  },

  mark: {
    type: String,
  },

  unit: {
    type: String,
  },

  type: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "CostType",
    },
  ],

  date: {
    type: Date,
    trim: true,
    required: [true, "Огноо сонгоно уу"],
  },

  picture: {
    type: String,
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

CostSchema.pre("update", function (next) {
  this.updateAt = Date.now;
  next();
});

module.exports = mongoose.model("Cost", CostSchema);
