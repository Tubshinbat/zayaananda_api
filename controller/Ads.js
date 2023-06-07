const Ads = require("../models/Ads");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createAds = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const ads = await Ads.create(req.body);
  res.status(200).json({
    success: true,
    data: ads,
  });
});

const useSearch = async (userFirstname) => {
  const userData = await User.find({
    firstName: { $regex: ".*" + userFirstname + ".*", $options: "i" },
  }).select("_id");
  return userData;
};

exports.getAdsies = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = { createAt: -1 };
  const select = req.query.select;
  // ADS FIELDS
  const name = req.query.name;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;
  const query = Ads.find();

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

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

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Ads, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const ads = await query.exec();

  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // ADS FIELDS
  const name = req.query.name;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;

  const query = Ads.find();

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

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

  if (valueRequired(status)) query.where("status").equals(status);

  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Ads, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const ads = await query.exec();

  return ads;
};

exports.excelData = asyncHandler(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // ADS FIELDS
  const name = req.query.name;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;

  const query = Ads.find();

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

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

  if (valueRequired(status)) query.where("status").equals(status);

  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Ads, result);
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

exports.multDeleteAds = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findAds = await Ads.find({ _id: { $in: ids } });

  if (findAds.length <= 0) {
    throw new MyError("Таны сонгосон мэдээлэлүүд олдсонгүй", 400);
  }
  findAds.map(async (el) => {
    el.pictures && (await imageDelete(el.pictures));
  });

  const ads = await Ads.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getAds = asyncHandler(async (req, res, next) => {
  const ads = await Ads.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!ads) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  ads.views = ads.views + 1;
  ads.save();

  res.status(200).json({
    success: true,
    data: ads,
  });
});

exports.updateAds = asyncHandler(async (req, res, next) => {
  let ads = await Ads.findById(req.params.id);

  if (!ads) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  if (valueRequired(req.body.pictures) === false) {
    req.body.pictures = [];
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  ads = await Ads.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: ads,
  });
});

exports.getCountAds = asyncHandler(async (req, res, next) => {
  const ads = await Ads.count();
  res.status(200).json({
    success: true,
    data: ads,
  });
});
