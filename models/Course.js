const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Сургалтын нэрийг оруулна уу"],
    trim: true,
    minlength: [2, "гарчиг хамгийн багадаа 2 дээш тэмдэгтээс бүтнэ."],
    maxlength: [250, "250 -аас дээш тэмдэгт оруулах боломжгүй"],
  },

  details: {
    type: String,
    trim: true,
  },

  slug: {
    type: String,
    trim: true,
  },

  pictures: {
    type: [String],
  },

  video: {
    type: String,
    trim: true,
    required: [true, "Хичээлээ оруулна уу"],
  },

  views: {
    type: Number,
    default: 0,
  },

  parentId: {
    type: mongoose.Schema.ObjectId,
    ref: "InitCourse",
  },

  position: {
    type: Number,
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

module.exports = mongoose.model("Course", CourseSchema);
