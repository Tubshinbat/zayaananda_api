const Order = require("../models/Order");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");

exports.createOrder = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.status = (valueRequired(req.body.status) && req.body.status) || true;

  if (req.body.userId) {
    const user = await User.findById(req.body.userId);
    req.body.lastName = req.body.lastName || user.lastName;
    req.body.firstName = req.body.firstName || user.firstName;
    req.body.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    req.body.createUser = req.body.userId;
  }

  if (req.body.carts) {
    let carts = req.body.carts;
    let ids = [];
    carts.map((cart) => {
      ids.push(cart.productInfo);
    });

    const products = await Product.find({}).where("_id").in(ids);
    let totalPrice = 0;
    products.map((product) => {
      carts.map((cart, index) => {
        if (cart.productInfo === product._id) {
          const price = product.discount ? product.discount : product.price;
          carts[index].price = parseInt(cart.qty) * parseInt(price);
        }
      });
    });

    carts.map((cart) => {
      totalPrice = totalPrice + cart.price;
    });

    req.body.totalPrice = totalPrice;
    req.body.carts = carts;
  } else {
    throw new MyError("Сагс хоосон байна");
  }

  const lastOrderNumber = await Order.findOne({}).sort({ orderNumber: -1 });

  if (lastOrderNumber) {
    req.body.orderNumber = parseInt(lastOrderNumber.orderNumber) + 1;
  } else {
    req.body.orderNumber = 1;
  }

  const order = await Order.create(req.body);
  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getOrders = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  // FIELDS
  const status = req.query.status;
  const orderNumber = req.query.orderNumber;
  const paid = req.query.paid;
  const paidType = req.query.paidType;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  const phoneNumber = req.query.phoneNumber;
  const email = req.query.email;
  const userId = req.query.userId;

  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  let sort = req.query.sort || { createAt: -1 };

  const query = Order.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(paid)) {
    if (paid.split(",").length > 1) {
      query.where("paid").in(paid.split(","));
    } else query.where("paid").equals(paid);
  }

  if (valueRequired(orderNumber)) {
    query.find({ orderNumber: RegexOptions(orderNumber) });
  }

  if (valueRequired(paidType)) {
    query.find({ paidType });
  }

  if (valueRequired(firstName)) {
    query.find({ firstName: RegexOptions(firstName) });
  }

  if (valueRequired(lastName)) {
    query.find({ lastName: RegexOptions(lastName) });
  }

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
  }

  if (valueRequired(userId)) {
    const userIds = await userSearch(userId);
    if (userIds.length > 0) {
      query.find({}).where("userId").in(userIds);
    } else {
      query.find({}).where("userId").in(userId);
    }
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    }
  }

  query.populate("carts.productInfo");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const order = await query.exec();

  res.status(200).json({
    success: true,
    count: order.length,
    data: order,
    pagination,
  });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  if (req.userId) {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new MyError("Хандах боломжгүй байна", 404);
    }
  } else {
    throw new MyError("Нэвтэрч орно уу", 400);
  }

  // FIELDS
  const query = Order.find({ userId: req.userId }).sort({ createAt: -1 });

  query.populate("carts.productInfo");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const order = await query.exec();

  res.status(200).json({
    success: true,
    count: order.length,
    data: order,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const orderNumber = req.query.orderNumber;
  const paid = req.query.paid;
  const paidType = req.query.paidType;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  const phoneNumber = req.query.phoneNumber;
  const email = req.query.email;
  const userId = req.query.userId;

  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  let sort = req.query.sort || { createAt: -1 };

  const query = Order.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(paid)) {
    if (paid.split(",").length > 1) {
      query.where("paid").in(paid.split(","));
    } else query.where("paid").equals(paid);
  }

  if (valueRequired(orderNumber)) {
    query.find({ orderNumber: RegexOptions(orderNumber) });
  }

  if (valueRequired(paidType)) {
    query.find({ paidType });
  }

  if (valueRequired(firstName)) {
    query.find({ firstName: RegexOptions(firstName) });
  }

  if (valueRequired(lastName)) {
    query.find({ lastName: RegexOptions(lastName) });
  }

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
  }

  if (valueRequired(email)) {
    query.find({ email: RegexOptions(email) });
  }

  if (valueRequired(userId)) {
    const userIds = await userSearch(userId);
    if (userIds.length > 0) {
      query.find({}).where("userId").in(userIds);
    } else {
      query.find({}).where("userId").in(userId);
    }
  }

  if (valueRequired(createUser)) {
    const userData = await useSearch(createUser);
    if (userData) {
      query.where("createUser").in(userData);
    }
  }

  if (valueRequired(updateUser)) {
    const userData = await useSearch(updateUser);
    if (userData) {
      query.where("updateUser").in(userData);
    }
  }
  query.sort(sort);

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    }
  }

  query.select(select);
  query.populate("carts.productInfo");
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Order, result);

  query.limit(limit);
  query.skip(pagination.start - 1);

  const order = await query.exec();

  return order;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 25;
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const orderNumber = req.query.orderNumber;
  const paid = req.query.paid;
  const paidType = req.query.paidType;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  const phoneNumber = req.query.phoneNumber;
  const email = req.query.email;
  const userId = req.query.userId;

  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  let sort = req.query.sort || { createAt: -1 };

  const query = Order.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(paid)) {
    if (paid.split(",").length > 1) {
      query.where("paid").in(paid.split(","));
    } else query.where("paid").equals(paid);
  }

  if (valueRequired(orderNumber)) {
    query.find({ orderNumber: RegexOptions(orderNumber) });
  }

  if (valueRequired(paidType)) {
    query.find({ paidType });
  }

  if (valueRequired(firstName)) {
    query.find({ firstName: RegexOptions(firstName) });
  }

  if (valueRequired(lastName)) {
    query.find({ lastName: RegexOptions(lastName) });
  }

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: RegexOptions(phoneNumber) });
  }

  if (valueRequired(email)) {
    query.find({ email: RegexOptions(email) });
  }

  if (valueRequired(userId)) {
    const userIds = await userSearch(userId);
    if (userIds.length > 0) {
      query.find({}).where("userId").in(userIds);
    } else {
      query.find({}).where("userId").in(userId);
    }
  }

  if (valueRequired(createUser)) {
    const userData = await useSearch(createUser);
    if (userData) {
      query.where("createUser").in(userData);
    }
  }

  if (valueRequired(updateUser)) {
    const userData = await useSearch(updateUser);
    if (userData) {
      query.where("updateUser").in(userData);
    }
  }
  query.sort(sort);

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    }
  }

  query.select(select);
  query.populate("carts.productInfo");
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Order, result);
  const pageCount = pagination.pageCount;
  let datas = [];

  for (let i = 1; i <= pageCount; i++) {
    const res = await getFullData(req, i);
    datas.push(...res);
  }

  res.status(200).json({
    success: true,
    count: datas.length,
    data: datas,
  });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("carts.productInfo")
    .populate("createUser")
    .populate("updateUser");

  if (!order) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteOrder = await Order.findByIdAndDelete(id);

  if (!deleteOrder) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: deleteOrder,
  });
});

exports.multDeleteOrder = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findOrders = await Order.find({ _id: { $in: ids } });

  if (findOrders.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд олдсонгүй", 400);
  }

  findOrders.map((el) => {
    el.pictures.map(async (el) => {
      await imageDelete(el.pictures);
    });
  });

  const order = await Order.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.updateOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  req.body.updateUser = req.userId;
  delete req.body.createUser;

  if (req.body.paid) {
    const sender_invoice_no = "P" + order.orderNumber;
    console.log(sender_invoice_no);
    const data = {
      isPaid: req.body.paid,
    };
    await Invoice.findOneAndUpdate({ sender_invoice_no }, data);
  }

  if (!order) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй", 404);
  }

  if (!valueRequired(req.body.pictures)) {
    req.body.pictures = [];
  }

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getCountOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.count();
  res.status(200).json({
    success: true,
    data: order,
  });
});
