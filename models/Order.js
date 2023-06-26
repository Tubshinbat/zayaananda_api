const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  orderNumber: {
    type: Number,
    trim: true,
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

  carts: [
    {
      productInfo: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      picture: {
        type: String,
      },
      name: {
        type: String,
      },
      qty: {
        type: String,
      },
      price: {
        type: Number,
      },
    },
  ],

  totalPrice: {
    type: Number,
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

module.exports = mongoose.model("Order", OrderSchema);
