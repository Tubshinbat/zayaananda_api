const asyncHandler = require("express-async-handler");
const axios = require("axios");

exports.getQpayToken = asyncHandler(async (req, res) => {
  let data = "";

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: "Basic WkFZQV9BTkFOREE6QnBRcUhmZkM=",
    },
    data: data,
  };

  await axios
    .request(config)
    .then((response) => {
      const token = response.data;

      const cookieOption = {
        expires_in: token.expires_in,
        httpOnly: false,
      };

      res
        .status(200)
        .cookie("qpaytoken", token.access_token, cookieOption)
        .json({
          success: true,
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

exports.createInvoice = asyncHandler(async (req, res) => {
  let data = JSON.stringify({
    invoice_code: "ZAYA_ANANDA_INVOICE",
    sender_invoice_no: "1234567",
    invoice_receiver_code: "terminal",
    invoice_description: "test",
    sender_branch_code: "SALBAR1",
    amount: 100,
    callback_url: `${process.env.BASE}payment/call?invoice=1234567`,
  });

  console.log(req.cookies["qpaytoken"]);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://merchant.qpay.mn/v2/invoice",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.cookies["qpaytoken"]}`,
    },
    data: data,
  };

  //   axios
  //     .request(config)
  //     .then((response) => {
  //       console.log(JSON.stringify(response.data));
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
});

exports.getCallBackPayment = asyncHandler(async (req, res) => {
  console.log(req.query.invoice);
});
