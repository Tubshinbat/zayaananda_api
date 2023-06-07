const Course = require("../models/Course");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete, multDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { slugify } = require("transliteration");
const { RegexOptions, useInitCourse } = require("../lib/searchOfterModel");

exports.createCourse = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.status = req.body.status || true;
  const parentId = req.body.parentId;

  const uniqueName = await Course.find({}).where("name").equals(req.body.name);
  if (uniqueName.length > 0) {
    req.body.slug = slugify(req.body.name) + "_" + uniqueName.length;
  } else {
    req.body.slug = slugify(req.body.name);
  }

  let position = 0;
  if (parentId) {
    const course = await Course.findOne({ parentId }).sort({
      position: -1,
    });
    if (course) {
      position = course.position + 1;
    }
  }

  req.body.position = position;

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // SEARCH FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const details = req.query.details;
  const parentId = req.query.parentId;
  const parent = req.query.parent;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Course.find();

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

  if (valueRequired(parentId)) {
    query.find({}).where("parentId").in(parentId);
  }

  if (valueRequired(parent)) {
    const initIds = await useInitCourse(parent);
    if (initIds.length > 0) query.find({}).where("parentId").in(initIds);
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

    query.populate("parentId");
    query.populate("createUser");
    query.populate("updateUser");
    query.select(select);

    const qc = query.toConstructor();
    const clonedQuery = new qc();
    const result = await clonedQuery.count();

    const pagination = await paginate(page, limit, Course, result);
    query.limit(limit);
    query.skip(pagination.start - 1);
    const courses = await query.exec();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      pagination,
    });
  }
});

const getFullData = async (req, page) => {
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // SEARCH FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const details = req.query.details;
  const parentId = req.query.parentId;
  const parent = req.query.parent;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Course.find();

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

  if (valueRequired(parentId)) {
    query.find({}).where("parentId").in(parentId);
  }

  if (valueRequired(parent)) {
    const initIds = await useInitCourse(parent);
    if (initIds.length > 0) query.find({}).where("parentId").in(initIds);
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
    }
  } else {
    query.sort(sort);
  }

  query.populate({ path: "parentId", select: "name -_id" });
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });
  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Course, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const courses = await query.exec();

  return courses;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = 1;
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // SEARCH FIELDS
  const status = req.query.status;
  const name = req.query.name;
  const details = req.query.details;
  const parentId = req.query.parentId;
  const parent = req.query.parent;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Course.find();

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

  if (valueRequired(parentId)) {
    query.find({}).where("parentId").in(parentId);
  }

  if (valueRequired(parent)) {
    const initIds = await useInitCourse(parent);
    if (initIds.length > 0) query.find({}).where("parentId").in(initIds);
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
    }
  } else {
    query.sort(sort);
  }

  query.populate("parentId");
  query.populate("createUser");
  query.populate("updateUser");
  query.select(select);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Course, result);
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

exports.multDeleteCourse = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const courses = await Course.find({ _id: { $in: ids } });

  if (courses.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд олдсонгүй", 404);
  }

  courses.map(async (el) => {
    if (el.pictures && typeof el.pictures == "String") {
      await imageDelete(el.pictures);
    } else if (el.pictures && el.pictures.length > 0) {
      el.pictures.map(async (picture) => {
        await imageDelete(picture);
      });
    }
    if (el.video) {
      await imageDelete(el.video);
    }
  });

  courses.map(async (el) => {
    el.video && (await imageDelete(el.video));
  });

  await Course.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id)
    .populate("parentId")
    .populate("createUser")
    .populate("updateUser");

  if (!course) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  course.views = course.views + 1;
  course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getSlugCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.query.slug })
    .populate("parentId")
    .populate("createUser")
    .populate("updateUser");

  if (!course) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  course.views = course.views + 1;
  course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!valueRequired(req.body.pictures)) {
    req.body.pictures = [];
  }

  if (!valueRequired(req.body.video)) {
    req.body.video = "";
  }

  if (!course) {
    throw new MyError("Өгөгдөл олдсонгүй", 404);
  }

  const name = req.body.name;
  const nameUnique = await Course.find({}).where("name").equals(name);

  if (nameUnique.length > 1) {
    req.body.slug = slugify(name) + "_" + nameUnique.length;
  } else {
    req.body.slug = slugify(name);
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getCountCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.count();
  res.status(200).json({
    success: true,
    data: course,
  });
});
