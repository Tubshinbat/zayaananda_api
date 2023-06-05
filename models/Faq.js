const mongoose = require("mongoose");

const FaqSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  type: {
    type: String,
    enum: ["Санал", "Хүсэлт", "Талархал", "Гомдол"],
    default: "Санал",
  },

  fullName: {
    type: String,
    trim: true,
  },

  phone: {
    type: Number,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Имэйл хаягаа буруу оруулсан байна",
    ],
  },

  name: {
    type: String,
  },

  question: {
    type: String,
    trim: true,
    required: [true, "Асуулт оруулна уу"],
  },

  answer: {
    type: String,
    trim: true,
  },

  tags: {
    type: [String],
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

module.exports = mongoose.model("Faq", FaqSchema);
