const InitCourse = require("../models/InitCourse");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete, multDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { slugify } = require("transliteration");
const { RegexOptions } = require("../lib/searchOfterModel");
const Course = require("../models/Course");

exports.createInitCourse = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.status = req.body.status || true;
  req.body.star = req.body.star || false;
  req.body.discount = req.body.discount || false;
  req.body.price = req.body.price ? parseInt(req.body.price) : 0;
  req.body.discount = req.body.discount ? parseInt(req.body.discount) : 0;

  const uniqueName = await InitCourse.find({})
    .where("name")
    .equals(req.body.name);
  if (uniqueName.length > 0) {
    req.body.slug = slugify(req.body.name) + "_" + uniqueName.length;
  } else {
    req.body.slug = slugify(req.body.name);
  }

  const initCourse = await InitCourse.create(req.body);

  res.status(200).json({
    success: true,
    data: initCourse,
  });
});

exports.getInitCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // SEARCH FIELDS
  const status = req.query.status;
  const star = req.query.star;
  const isDiscount = req.query.isDiscount;
  const type = req.query.type;
  const name = req.query.name;
  const details = req.query.details;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = InitCourse.find();

  if (valueRequired(isDiscount)) {
    if (isDiscount.split(",").length > 1) {
      query.where("isDiscount").in(isDiscount.split(","));
    } else query.where("isDiscount").equals(isDiscount);
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) {
      query.where("star").in(star.split(","));
    } else query.where("star").equals(star);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(details)) {
    query.find({ details: RegexOptions(details) });
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

  query.populate("createUser");
  query.populate("updateUser");
  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, InitCourse, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const initCourses = await query.exec();

  res.status(200).json({
    success: true,
    count: initCourses.length,
    data: initCourses,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // SEARCH FIELDS
  const status = req.query.status;
  const star = req.query.star;
  const isDiscount = req.query.isDiscount;
  const type = req.query.type;
  const name = req.query.name;
  const details = req.query.details;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = InitCourse.find();

  if (valueRequired(isDiscount)) {
    if (isDiscount.split(",").length > 1) {
      query.where("isDiscount").in(isDiscount.split(","));
    } else query.where("isDiscount").equals(isDiscount);
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) {
      query.where("star").in(star.split(","));
    } else query.where("star").equals(star);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(details)) {
    query.find({ details: RegexOptions(details) });
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

  query.populate({ path: "createUser", select: "firstname -_id" });
  query.populate({ path: "updateUser", select: "firstname -_id" });
  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, InitCourse, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const initCourses = await query.exec();

  return initCourses;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = 1;
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // SEARCH FIELDS
  const status = req.query.status;
  const star = req.query.star;
  const isDiscount = req.query.isDiscount;
  const type = req.query.type;
  const name = req.query.name;
  const details = req.query.details;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = InitCourse.find();

  if (valueRequired(isDiscount)) {
    if (isDiscount.split(",").length > 1) {
      query.where("isDiscount").in(isDiscount.split(","));
    } else query.where("isDiscount").equals(isDiscount);
  }

  if (valueRequired(type)) {
    if (type.split(",").length > 1) {
      query.where("type").in(type.split(","));
    } else query.where("type").equals(type);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) {
      query.where("star").in(star.split(","));
    } else query.where("star").equals(star);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(name)) {
    query.find({ name: RegexOptions(name) });
  }

  if (valueRequired(details)) {
    query.find({ details: RegexOptions(details) });
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

  query.populate("createUser");
  query.populate("updateUser");
  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, InitCourse, result);
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

exports.multDeleteInitCourse = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const initCourses = await InitCourse.find({ _id: { $in: ids } });

  if (initCourses.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд олдсонгүй", 404);
  }

  initCourses.map(async (el) => {
    if (el.pictures && typeof el.pictures == "String") {
      await imageDelete(el.pictures);
    } else if (el.pictures && el.pictures.length > 0) {
      el.pictures.map(async (picture) => {
        await imageDelete(picture);
      });
    }
  });

  await InitCourse.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getInitCourse = asyncHandler(async (req, res) => {
  const initCourse = await InitCourse.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!initCourse) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  initCourse.views = initCourse.views + 1;
  initCourse.save();

  res.status(200).json({
    success: true,
    data: initCourse,
  });
});

exports.getSlugInitCourse = asyncHandler(async (req, res) => {
  const initCourse = await InitCourse.findOne({ slug: req.query.slug })
    .populate("parentId")
    .populate("createUser")
    .populate("updateUser");

  if (!initCourse) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  initCourse.views = initCourse.views + 1;
  initCourse.save();

  res.status(200).json({
    success: true,
    data: initCourse,
  });
});

exports.updateInitCourse = asyncHandler(async (req, res) => {
  let initCourse = await InitCourse.findById(req.params.id);

  if (!initCourse) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const name = req.body.name;
  const nameUnique = await InitCourse.find({}).where("name").equals(name);
  const cNameUnique = await Course.find({}).where("name").equals(name);

  if (nameUnique.length > 1) {
    req.body.slug = slugify(name) + "_" + nameUnique.length;
  } else if (cNameUnique.length > 0) {
    req.body.slug = slugify(name) + "_" + cNameUnique.length;
  } else {
    req.body.slug = slugify(name);
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  initCourse = await InitCourse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: initCourse,
  });
});

exports.getCountInitCourse = asyncHandler(async (req, res, next) => {
  const initCourse = await InitCourse.count();
  res.status(200).json({
    success: true,
    data: initCourse,
  });
});
