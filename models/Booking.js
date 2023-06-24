const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const BookingSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  bookingNumber: {
    type: Number,
    trim: true,
    unique: true,
  },

  paid: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  paidType: {
    type: String,
    enum: ["qpay", "bankaccount"],
  },

  paidAdvance: {
    type: Number,
    trim: true,
    default: 0,
  },

  service: {
    type: mongoose.Schema.ObjectId,
    ref: "Service",
    required: [true, "Үйлчилгээнээс сонгоно уу"],
  },

  date: {
    type: Date,
    required: [true, "Өдрөө сонгоно уу"],
  },

  time: {
    type: String,
    required: [true, "Цагаа сонгоно уу"],
  },

  bookingMsg: {
    type: String,
    trim: true,
  },

  firstName: {
    type: String,
    required: [true, "Нэрээ оруулна уу"],
    trim: true,
    minlength: [2, "гарчиг хамгийн багадаа 2 дээш тэмдэгтээс бүтнэ."],
    maxlength: [250, "250 -аас дээш тэмдэгт оруулах боломжгүй"],
  },

  lastName: {
    type: String,
    required: [true, "Овогоо оруулна уу"],
    trim: true,
    minlength: [2, "гарчиг хамгийн багадаа 2 дээш тэмдэгтээс бүтнэ."],
    maxlength: [250, "250 -аас дээш тэмдэгт оруулах боломжгүй"],
  },

  phoneNumber: {
    type: Number,
    required: [true, "Утасны дугаараа оруулна уу"],
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

  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("Booking", BookingSchema);
