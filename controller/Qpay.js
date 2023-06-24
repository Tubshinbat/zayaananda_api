const Qpay = require("../models/Qpay");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Invoice = require("../models/Invoice");
const MyError = require("../utils/myError");
const Booking = require("../models/Booking");

const getQpayAccess = () => {
  let data = "";

  var username = "TEST_MERCHANT ";
  var password = "123456";
  var auth = "Basic VEVTVF9NRVJDSEFOVDoxMjM0NTY=";

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: auth,
      Cookie:
        "_4d45d=http://10.233.105.162:3000; qpay_merchant_openapi.sid=s%3AQvJM5t0m27_mHdJnc5oZ7TJR1uTeHe_R.6Hhg%2BSPuag%2B3Qxpba%2BPg9qBT8gRBv8biZwrSugZn0dk",
    },
    data: data,
  };

  axios
    .request(config)
    .then(async (response) => {
      await Qpay.create(response.data);
    })
    .catch((error) => {
      return error;
    });
};

exports.getQpayToken = asyncHandler(async (req, res) => {
  const lastQpayData = await Qpay.findOne({}).sort({ createAt: -1 });
  if (!lastQpayData) {
    getQpayAccess();
  } else if (lastQpayData.createAt) {
    const initialDate = new Date(lastQpayData.createAt);
    const expiryDate = new Date(
      initialDate.valueOf() + lastQpayData.expires_in
    );

    if (expiryDate.getTime() < new Date().getTime()) {
      getQpayAccess();
    }
  }

  res.status(200).json({
    success: true,
  });
});

exports.createInvoice = asyncHandler(async (req, res) => {
  let data = JSON.stringify({
    invoice_code: "TEST_INVOICE",
    sender_invoice_no: req.body.sender_invoice_no,
    invoice_receiver_code: "terminal",
    invoice_description: req.body.invoice_description,
    sender_branch_code: req.body.sender_branch_code,
    amount: req.body.amount,
    callback_url: `${process.env.BASE}payment/call?invoice=${req.body.sender_invoice_no}`,
  });

  const accessToken = await Qpay.findOne({}).sort({ createAt: -1 });

  if (!accessToken) {
    getQpayAccess();
    throw new MyError("Дахин оролдоно уу");
  }

  let config = {
    method: "POST",
    maxBodyLength: Infinity,
    url: "https://merchant.qpay.mn/v2/invoice",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.access_token}`,
    },
    data: data,
  };

  const response = await axios.request(config);

  if (response) {
    const invoice = await Invoice.create({
      invoice_id: response.data.invoice_id,
      sender_invoice_no: req.body.sender_invoice_no,
      invoice_receiver_code: "terminal",
      invoice_description: req.body.invoice_description,
      sender_branch_code: req.body.sender_branch_code,
      amount: req.body.amount,
    });

    res.status(200).json({
      success: true,
      data: response.data,
      invoice,
    });
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

exports.getCallBackPayment = asyncHandler(async (req, res) => {
  const invoice = req.query.invoice;
  const result = await Invoice.findOne({ sender_invoice_no: invoice });

  let config = {
    method: "POST",
    maxBodyLength: Infinity,
    url: "https://merchant.qpay.mn/v2/payment/check",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.access_token}`,
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: result.invoice_id,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    }),
  };

  const response = await axios.request(config);

  if (!response) {
    throw new MyError("Төлбөр төлөгдөөгүй байна.");
  }

  if (response.payment_status !== "PAID") {
    throw new MyError("Төлбөр төлөгдөөгүй байна.");
  }

  if (!result) {
    throw new MyError("Төлбөр төлөгдөөгүй байна.");
  }


    result.isPaid = true;
    result.save();

    const type = result.sender_branch_code;

    if (type === "booking") {
      const id = parseInt(invoice);
      const booking = await Booking.findOne({ bookingNumber: id });
      if (booking) {
        (booking.paidType = "qpay"), (booking.paidAdvance = result.amount);
        (booking.status = true), booking.save();
      }
    }
    
    

});
