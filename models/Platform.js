const mongoose = require("mongoose");

const PlatformSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  isDirect: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    minlength: [3, "Платформын нэр хамгийн багадаа 3 дээш тэмдэгтээс бүтнэ."],
    maxlength: [150, "150 -аас дээш тэмдэгт оруулах боломжгүй"],
  },

  direct: {
    type: String,
    trim: true,
  },

  details: {
    type: String,
    maxlength: [350, "Баннерын тайлбар 350 - аас дээш оруулах боломжгүй"],
  },

  icon: {
    type: String,
  },

  picture: {
    type: String,
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

PlatformSchema.pre("update", function (next) {
  this.updateAt = Date.now;
  next();
});

module.exports = mongoose.model("Platform", PlatformSchema);
