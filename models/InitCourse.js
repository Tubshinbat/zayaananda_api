const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const InitCourseSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  star: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  isDiscount: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    required: [true, "Сургалтын нэрийг оруулна уу"],
    trim: true,
    minlength: [2, "гарчиг хамгийн багадаа 2 дээш тэмдэгтээс бүтнэ."],
    maxlength: [250, "250 -аас дээш тэмдэгт оруулах боломжгүй"],
  },

  type: {
    type: String,
    enum: ["online", "local"],
    default: "online",
  },

  details: {
    type: String,
    trim: true,
  },

  slug: {
    type: String,
    trim: true,
  },

  price: {
    type: Number,
    trim: true,
    required: [true, "Сургалтын үнийг оруулна уу"],
  },

  discount: {
    type: Number,
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

module.exports = mongoose.model("InitCourse", InitCourseSchema);
