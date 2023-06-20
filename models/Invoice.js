const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  isPaid: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
  sender_invoice_no: {
    type: String,
    trim: true,
    required: [true, "Нэхэмжлэлийн дугаар оруулна уу"],
  },
  sender_branch_code: {
    type: String,
    enum: ["product", "course", "booking"],
  },
  invoice_receiver_code: {
    type: Number,
    required: [true, "Худалдан авагчийн id оруулна уу"],
  },
  invoice_description: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
