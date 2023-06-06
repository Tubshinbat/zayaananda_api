const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  lastName: {
    type: String,
    trim: true,
    default: "",
  },

  firstName: {
    type: String,
    trim: true,
    default: "",
  },

  position: {
    type: String,
    trim: true,
  },

  image: {
    type: String,
    default: null,
  },

  details: {
    type: String,
    trim: true,
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
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
});

module.exports = mongoose.model("Employee", EmployeeSchema);
