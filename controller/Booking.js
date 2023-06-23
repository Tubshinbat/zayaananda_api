const Booking = require("../models/Booking");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, useServiceSearch } = require("../lib/searchOfterModel");

exports.createBooking = asyncHandler(async (req, res, next) => {
  req.body.paidAdvance = parseInt(req.body.paidAdvance) || 0;

  if (valueRequired(req.body.time) && valueRequired(req.body.date)) {
    const sameDate = await Booking.find({})
      .where("status")
      .equals(true)
      .where("date")
      .equals(req.body.date)
      .where("time")
      .equals(req.body.time)
      .where("service")
      .in(req.body.service);

    const currentDate = new Date().toJSON().slice(0, 10);

    if (req.body.date < currentDate) {
      throw new MyError("Тухайн цаг дээр захиалга авах боломжгүй.");
    }

    const time = new Date();
    const timeNow = parseInt(
      time.toLocaleString("en-US", { hour: "numeric", hour12: false })
    );

    if (req.body.date === currentDate && parseInt(req.body.time) <= timeNow) {
      throw new MyError("Тухайн цаг дээр захиалга авах боломжгүй.", 404);
    }

    if (sameDate.length > 0)
      throw new MyError("Тухайн цаг дээр захиалга үүссэн байна.");
  } else if (!valueRequired(req.body.time) || !valueRequired(req.body.date)) {
    throw new MyError("Цаг болон өдрөө заавал оруулна уу");
  }

  if (req.body.userId) {
    const user = await User.findById(req.body.userId);
    req.body.lastName = req.body.lastName || user.lastName;
    req.body.firstName = req.body.firstName || user.firstName;
    req.body.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    req.body.email = req.body.email || user.email;
    req.body.createUser = req.body.userId;
  }

  req.body.paid = (valueRequired(req.body.paid) && req.body.paid) || false;

  const lastOrderNumber = await Booking.findOne({}).sort({ bookingNumber: -1 });

  if (lastOrderNumber && lastOrderNumber.bookingNumber) {
    req.body.bookingNumber = parseInt(lastOrderNumber.bookingNumber) + 1;
  } else {
    req.body.bookingNumber = 1;
  }

  const booking = await Booking.create(req.body);

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.checkBooking = asyncHandler(async (req, res, next) => {
  req.body.paidAdvance = parseInt(req.body.paidAdvance) || 0;

  if (valueRequired(req.body.time) && valueRequired(req.body.date)) {
    const sameDate = await Booking.find({})
      .where("status")
      .equals(true)
      .where("date")
      .in(req.body.date)
      .where("time")
      .equals(req.body.time)
      .where("service")
      .in(req.body.service);

    const currentDate = new Date().toJSON().slice(0, 10);

    if (req.body.date < currentDate) {
      throw new MyError("Тухайн цаг дээр захиалга авах боломжгүй.", 404);
    }
    const time = new Date();
    const timeNow = parseInt(
      time.toLocaleString("en-US", { hour: "numeric", hour12: false })
    );

    if (req.body.date === currentDate && parseInt(req.body.time) <= timeNow) {
      throw new MyError("Тухайн цаг дээр захиалга авах боломжгүй.", 404);
    }

    if (sameDate.length > 0)
      throw new MyError("Тухайн цаг дээр захиалга үүссэн байна.", 404);
  } else if (!valueRequired(req.body.time) || !valueRequired(req.body.date)) {
    throw new MyError("Цаг болон өдрөө заавал оруулна уу", 404);
  }

  if (req.body.userId) {
    const user = await User.findById(req.body.userId);
    req.body.lastName = req.body.lastName || user.lastName;
    req.body.firstName = req.body.firstName || user.firstName;
    req.body.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    req.body.email = req.body.email || user.email;
    req.body.createUser = req.body.userId;
  }

  req.body.paid = (valueRequired(req.body.paid) && req.body.paid) || false;

  const lastOrderNumber = await Booking.findOne({}).sort({ bookingNumber: -1 });

  res.status(200).json({
    success: true,
  });
});

exports.getBookings = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // DATA FIELDS
  const status = req.query.status;
  const paid = req.query.paid;
  const bookingNumber = req.query.bookingNumber;
  const paidType = req.query.paidType;
  const service = req.query.serivce;
  const date = req.query.date;
  const time = req.query.time;
  const bookingMsg = req.query.bookingMsg;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  const phoneNumber = req.query.phoneNumber;
  const email = req.query.email;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Booking.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(paid)) {
    const splitData = paid.split(",");
    if (splitData.length > 1) {
      query.where("paid").in(paid.split(","));
    } else query.where("paid").equals(paid);
  }

  if (valueRequired(paidType)) {
    query.find({ paidType });
  }

  if (valueRequired(bookingNumber)) {
    query.find({ bookingNumber: RegexOptions(bookingNumber) });
  }

  if (valueRequired(service)) {
    const serviceIds = useServiceSearch(service);
    query.find({}).where("service").in(serviceIds);
  }

  if (valueRequired(date)) {
    query.find({ date });
  }

  if (valueRequired(time)) {
    query.find({ time });
  }

  if (valueRequired(bookingMsg)) {
    query.find({ bookingMsg: RegexOptions(bookingMsg) });
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

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      if (spliteSort.length > 0) {
        let convertSort = {};
        if (spliteSort[1] === "ascend") {
          convertSort = { [spliteSort[0]]: 1 };
        } else {
          convertSort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(convertSort);
      }

      const splite = sort.split("_");
      if (splite.length > 0) {
        let convertSort = {};
        if (splite[1] === "ascend") {
          convertSort = { [splite[0]]: 1 };
        } else {
          convertSort = { [splite[0]]: -1 };
        }
        if (splite[0] != "undefined") query.sort(convertSort);
      }
    } else {
      query.sort(sort);
    }
  }

  query.populate("service");
  query.populate("createUser");
  query.populate("updateUser");
  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Booking, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const booking = await query.exec();

  res.status(200).json({
    success: true,
    count: booking.length,
    data: booking,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;
  let sort = req.query.sort || { createAt: -1 };

  // DATA FIELDS
  const status = req.query.status;
  const paid = req.query.paid;
  const bookingNumber = req.query.bookingNumber;
  const paidType = req.query.paidType;
  const service = req.query.serivce;
  const date = req.query.date;
  const time = req.query.time;
  const bookingMsg = req.query.bookingMsg;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  const phoneNumber = req.query.phoneNumber;
  const email = req.query.email;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Booking.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(paid)) {
    const splitData = paid.split(",");
    if (splitData.length > 1) {
      query.where("paid").in(paid.split(","));
    } else query.where("paid").equals(paid);
  }

  if (valueRequired(paidType)) {
    query.find({ paidType });
  }

  if (valueRequired(bookingNumber)) {
    query.find({ bookingNumber: RegexOptions(bookingNumber) });
  }

  if (valueRequired(service)) {
    const serviceIds = useServiceSearch(service);
    query.find({}).where("service").in(serviceIds);
  }

  if (valueRequired(date)) {
    query.find({ date });
  }

  if (valueRequired(time)) {
    query.find({ time });
  }

  if (valueRequired(bookingMsg)) {
    query.find({ bookingMsg: RegexOptions(bookingMsg) });
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

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      if (spliteSort.length > 0) {
        let convertSort = {};
        if (spliteSort[1] === "ascend") {
          convertSort = { [spliteSort[0]]: 1 };
        } else {
          convertSort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(convertSort);
      }

      const splite = sort.split("_");
      if (splite.length > 0) {
        let convertSort = {};
        if (splite[1] === "ascend") {
          convertSort = { [splite[0]]: 1 };
        } else {
          convertSort = { [splite[0]]: -1 };
        }
        if (splite[0] != "undefined") query.sort(convertSort);
      }
    } else {
      query.sort(sort);
    }
  }

  query.populate({ path: "service", select: "name -_id" });
  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Booking, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const booking = await query.exec();

  return booking;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // DATA FIELDS
  const status = req.query.status;
  const paid = req.query.paid;
  const bookingNumber = req.query.bookingNumber;
  const paidType = req.query.paidType;
  const service = req.query.serivce;
  const date = req.query.date;
  const time = req.query.time;
  const bookingMsg = req.query.bookingMsg;
  const firstName = req.query.firstName;
  const lastName = req.query.lastName;
  const phoneNumber = req.query.phoneNumber;
  const email = req.query.email;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Booking.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(paid)) {
    const splitData = paid.split(",");
    if (splitData.length > 1) {
      query.where("paid").in(paid.split(","));
    } else query.where("paid").equals(paid);
  }

  if (valueRequired(paidType)) {
    query.find({ paidType });
  }

  if (valueRequired(bookingNumber)) {
    query.find({ bookingNumber: RegexOptions(bookingNumber) });
  }

  if (valueRequired(service)) {
    const serviceIds = useServiceSearch(service);
    query.find({}).where("service").in(serviceIds);
  }

  if (valueRequired(date)) {
    query.find({ date });
  }

  if (valueRequired(time)) {
    query.find({ time });
  }

  if (valueRequired(bookingMsg)) {
    query.find({ bookingMsg: RegexOptions(bookingMsg) });
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

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      if (spliteSort.length > 0) {
        let convertSort = {};
        if (spliteSort[1] === "ascend") {
          convertSort = { [spliteSort[0]]: 1 };
        } else {
          convertSort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(convertSort);
      }

      const splite = sort.split("_");
      if (splite.length > 0) {
        let convertSort = {};
        if (splite[1] === "ascend") {
          convertSort = { [splite[0]]: 1 };
        } else {
          convertSort = { [splite[0]]: -1 };
        }
        if (splite[0] != "undefined") query.sort(convertSort);
      }
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("service");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Booking, result);
  const pageCount = pagination.pageCount;
  let datas = [];

  for (let i = 1; i <= pageCount; i++) {
    const res = await getFullData(req, i);
    datas.push(...res);
  }

  res.status(200).json({
    success: true,
    data: datas,
  });
});

exports.multDeleteBooking = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBookings = await Booking.find({ _id: { $in: ids } });

  if (findBookings.length <= 0) {
    throw new MyError("Таны сонгосон мэдээнүүд олдсонгүй", 400);
  }

  await Booking.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id)
    .populate("service")
    .populate("createUser")
    .populate("updateUser");

  if (!booking) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  const currentDate = new Date().toJSON().slice(0, 10);

  if (req.body.date < currentDate) {
    throw new MyError("Тухайн цаг дээр захиалга авах боломжгүй.");
  }

  const sameDate = await Booking.find({})
    .where("status")
    .equals(true)
    .where("date")
    .equals(req.body.date)
    .where("time")
    .equals(req.body.time);

  if (sameDate.length > 0) {
    let isSame = true;
    if (sameDate.length === 1) {
      if (
        sameDate[0].firstName === req.body.firstName ||
        sameDate[0].phoneNumber === req.body.phoneNumber
      ) {
        isSame = false;
      }
    }
    if (isSame === true) {
      throw new MyError("Тухайн цаг дээр захиалга үүссэн байна.");
    }
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.getCountBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.count();
  res.status(200).json({
    success: true,
    data: booking,
  });
});
