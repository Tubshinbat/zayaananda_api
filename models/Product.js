const mongoose = require("mongoose");


const ProductSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: [true, 'Бүтээгдэхүүний нэр оруулна уу']
  },

  slug: {
    type: String,
  },

  pictures: {
    type: [String],
  },

  price: {
    type: Number,
    trim: true,
    required: [true, 'Үнийн мэдээлэл оруулна уу']
  },

  discount: {
    type: Number,
    trim: true,
    default: 0,
  },

  details: {
    type: String,
    trim: true,
  },

  views:{
    type:Number,
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

module.exports = mongoose.model("Product", ProductSchema);
