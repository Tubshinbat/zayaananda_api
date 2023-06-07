const AdsBanner = require("../models/AdsBanner");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createAdsBanner = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const adsBanner = await AdsBanner.create(req.body);
  res.status(200).json({
    success: true,
    data: adsBanner,
  });
});

const useSearch = async (userFirstname) => {
  const userData = await User.find({
    firstName: { $regex: ".*" + userFirstname + ".*", $options: "i" },
  }).select("_id");
  return userData;
};

exports.getAdsBanners = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // ADSBANNER FIELDS
  const type = req.query.type;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;

  const query = AdsBanner.find();

  if (valueRequired(createUser)) {
    const userData = await useSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await useSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
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
    } else {
      query.sort(sort);
    }
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, AdsBanner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const adsBanner = await query.exec();

  res.status(200).json({
    success: true,
    count: adsBanner.length,
    data: adsBanner,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // ADSBANNER FIELDS
  const name = req.query.name;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const type = req.query.type;

  const query = AdsBanner.find();

  if (valueRequired(createUser)) {
    const userData = await useSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await useSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
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
    } else {
      query.sort(sort);
    }
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }
  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const adsBanners = await query.exec();

  res.status(200).json({
    success: true,
    count: adsBanners.length,
    data: adsBanners,
  });
});

exports.multDeleteAdsBanner = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findAdsBanner = await AdsBanner.find({ _id: { $in: ids } });

  if (findAdsBanner.length <= 0) {
    throw new MyError("Таны сонгосон мэдээлэлүүд олдсонгүй", 400);
  }
  findAdsBanner.map(async (el) => {
    el.picture && (await imageDelete(el.picture));
    el.bigPicture && (await imageDelete(el.bigPicture));
  });

  const adsBanner = await AdsBanner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getAdsBanner = asyncHandler(async (req, res, next) => {
  const adsBanner = await AdsBanner.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!adsBanner) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: adsBanner,
  });
});

exports.updateAdsBanner = asyncHandler(async (req, res, next) => {
  let adsBanner = await AdsBanner.findById(req.params.id);

  if (!adsBanner) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  adsBanner = await AdsBanner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: adsBanner,
  });
});

exports.getCountAdsBanner = asyncHandler(async (req, res, next) => {
  const adsBanner = await AdsBanner.count();
  res.status(200).json({
    success: true,
    data: adsBanner,
  });
});
