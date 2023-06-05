const Platform = require("../models/Platform");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createPlatform = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  req.body.status = (valueRequired(req.body.status) && req.body.status) || true;
  const platform = await Platform.create(req.body);
  res.status(200).json({
    success: true,
    data: platform,
  });
});

const useSearch = async (userFirstname) => {
  const userData = await User.find({
    firstname: { $regex: ".*" + userFirstname + ".*", $options: "i" },
  }).select("_id");
  return userData;
};

exports.getPlatforms = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const isDirect = req.body.isDirect;
  const driect = req.body.driect;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Platform.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(isDirect)) {
    if (isDirect.split(",").length > 1)
      query.where("isDirect").in(isDirect.split(","));
    else query.where("isDirect").in(isDirect);
  }

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  if (valueRequired(driect))
    query.find({ driect: { $regex: ".*" + driect + ".*", $options: "i" } });

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

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Platform, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const platform = await query.exec();

  res.status(200).json({
    success: true,
    count: platform.length,
    data: platform,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;

  // NEWS FIELDS
  const status = req.query.status;
  const isDirect = req.query.isDirect;
  const name = req.query.name;
  const driect = req.query.driect;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  let sort = req.query.sort || { createAt: -1 };

  const query = Platform.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(isDirect)) {
    if (isDirect.split(",").length > 1)
      query.where("isDirect").in(isDirect.split(","));
    else query.where("isDirect").in(isDirect);
  }

  if (valueRequired(driect))
    query.find({ driect: { $regex: ".*" + driect + ".*", $options: "i" } });

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

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
  query.populate({ path: "createUser", select: "firstname -_id" });
  query.populate({ path: "updateUser", select: "firstname -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Platform, result);
  query.limit(limit);
  query.skip(pagination.start - 1);

  const platform = await query.exec();

  return platform;
};

exports.excelData = asyncHandler(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 25;
  const select = req.query.select;

  // NEWS FIELDS
  const status = req.query.status;
  const isDirect = req.query.isDirect;
  const name = req.query.name;
  const driect = req.query.driect;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  let sort = req.query.sort || { createAt: -1 };

  const query = Platform.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(isDirect)) {
    if (isDirect.split(",").length > 1)
      query.where("isDirect").in(isDirect.split(","));
    else query.where("isDirect").in(isDirect);
  }

  if (valueRequired(driect))
    query.find({ driect: { $regex: ".*" + driect + ".*", $options: "i" } });

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

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
  query.populate({ path: "createUser", select: "firstname -_id" });
  query.populate({ path: "updateUser", select: "firstname -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Platform, result);
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

exports.multDeletePlatform = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findPlatform = await Platform.find({ _id: { $in: ids } });

  if (findPlatform.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд олдсонгүй.", 404);
  }

  findPlatform.map(async (el) => {
    el.picture && (await imageDelete(el.picture));
    el.icon && (await imageDelete(el.icon));
  });

  const platform = await Platform.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getPlatform = asyncHandler(async (req, res, next) => {
  const platform = await Platform.findByIdAndUpdate(req.params.id).populate(
    "createUser"
  );

  if (!platform) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  platform.views = platform.views + 1;
  platform.save();

  res.status(200).json({
    success: true,
    data: platform,
  });
});

exports.updatePlatform = asyncHandler(async (req, res, next) => {
  let platform = await Platform.findById(req.params.id);

  if (!platform) {
    throw new MyError("Мэдээлэл олдсонгүй. ", 404);
  }

  if (!valueRequired(req.body.picture)) {
    req.body.picture = null;
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  platform = await Platform.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: platform,
  });
});

exports.getCountPlatform = asyncHandler(async (req, res, next) => {
  const platform = await Platform.count();
  res.status(200).json({
    success: true,
    data: platform,
  });
});

exports.getSlugPlatform = asyncHandler(async (req, res, next) => {
  const platform = await Platform.findOne({ slug: req.params.slug }).populate(
    "createUser"
  );

  if (!platform) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  platform.views = platform.views + 1;
  platform.update();

  res.status(200).json({
    success: true,
    data: platform,
  });
});
