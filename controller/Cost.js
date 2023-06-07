const Cost = require("../models/Cost");
const CostType = require("../models/CostType");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const XLSX = require("xlsx");
const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const moment = require("moment");

exports.createCost = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const cost = await Cost.create(req.body);
  res.status(200).json({
    success: true,
    data: cost,
  });
});

const costCategorySearch = async (key) => {
  const ids = await CostType.find({
    name: { $regex: ".*" + key + ".*", $options: "i" },
  }).select("_id");
  return ids;
};

const useSearch = async (userFirstname) => {
  const userData = await User.find({
    firstName: { $regex: ".*" + userFirstname + ".*", $options: "i" },
  }).select("_id");
  return userData;
};

exports.getCosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // COST FIELDS
  const name = req.query.name;
  const costType = req.query.costType;
  const type = req.query.type;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;
  const day = req.query.day;
  const year = req.query.year;
  const mount = req.query.mount;
  const query = Cost.find();
  const yearMin = req.query.yearMin;
  const yearMax = req.query.yearMax;

  if (valueRequired(year)) query.where("year").equals(year);
  if (valueRequired(mount)) query.where("mount").equals(mount);
  if (valueRequired(day)) query.where("day").equals(day);

  if (valueRequired(type)) {
    const types = await costCategorySearch(type);
    if (types && types.length > 0) query.where("type").in(types);
    else query.where("type").in(type);
  }

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  if (valueRequired(costType)) {
    const types = await costCategorySearch(costType);
    if (types) query.where("type").in(types);
  }

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
  query.populate("type");
  query.populate("createUser");
  query.populate("updateUser");

  if (valueRequired(yearMax) && valueRequired(yearMin)) {
    query.find({
      date: { $gte: yearMin + "-01-01", $lte: yearMax + "-12-31" },
    });
  } else if (valueRequired(yearMax) && valueRequired(yearMin) === false) {
    query.find({
      date: { $lte: yearMax + "-12-31" },
    });
  } else if (valueRequired(yearMax) === false && valueRequired(yearMin)) {
    query.find({
      date: { $gte: yearMin + "-01-01" },
    });
  }

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Cost, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const cost = await query.exec();

  res.status(200).json({
    success: true,
    count: cost.length,
    data: cost,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // COST FIELDS
  const name = req.query.name;
  const costType = req.query.costType;
  const type = req.query.type;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;
  const day = req.query.day;
  const year = req.query.year;
  const mount = req.query.mount;

  const query = Cost.find();

  if (valueRequired(year)) query.where("year").equals(year);
  if (valueRequired(mount)) query.where("mount").equals(mount);
  if (valueRequired(day)) query.where("day").equals(day);

  if (valueRequired(type)) {
    query.where("type").in(type);
  }

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  if (valueRequired(costType)) {
    const types = await costCategorySearch(costType);
    if (types) query.where("type").in(types);
  }

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

  query.populate({ path: "type", select: "name -_id" });
  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const costs = await query.exec();

  res.status(200).json({
    success: true,
    count: costs.length,
    data: costs,
  });
});

exports.multDeleteCost = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCost = await Cost.find({ _id: { $in: ids } });

  if (findCost.length <= 0) {
    throw new MyError("Таны сонгосон мэдээнүүд олдсонгүй", 400);
  }

  if (findCost.length > 0) {
    findCost.map(async (el) => {
      el.picture && (await imageDelete(el.picture));
    });
  }

  const cost = await Cost.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getCost = asyncHandler(async (req, res, next) => {
  const cost = await Cost.findByIdAndUpdate(req.params.id)
    .populate("type")
    .populate("createUser")
    .populate("updateUser");

  if (!cost) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: cost,
  });
});

exports.updateCost = asyncHandler(async (req, res, next) => {
  let cost = await Cost.findById(req.params.id);

  if (!cost) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  if (valueRequired(req.body.picture) === false) {
    req.body.picture = "";
  }

  if (valueRequired(req.body.type) === false) {
    req.body.type = [];
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  cost = await Cost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: cost,
  });
});

exports.getCountCost = asyncHandler(async (req, res, next) => {
  const cost = await Cost.count();
  res.status(200).json({
    success: true,
    data: cost,
  });
});

exports.excelConvert = asyncHandler(async (req, res) => {
  const files = req.files;

  const workbook = XLSX.read(files.file.data, {
    cellDates: true,
    dateNF: "dd/mm/yy",
  });
  let worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (worksheet[`A1`].v !== "name")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (name)");
  if (worksheet[`B1`].v !== "mark")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (mark)");
  if (worksheet[`C1`].v !== "unit")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (unit)");
  if (worksheet[`D1`].v !== "minPrice")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (minPrice)");
  if (worksheet[`E1`].v !== "maxPrice")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (maxPrice)");
  if (worksheet[`F1`].v !== "averagePrice")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (averagePrice)");
  if (worksheet[`G1`].v !== "priceNotNoat")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (priceNotNoat)");
  if (worksheet[`H1`].v !== "type")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (type)");
  if (worksheet[`I1`].v !== "date")
    throw new MyError("Excel - ийн толгойны нэр буруу байна (date)");

  for (let index = 2; index < 500; index++) {
    if (!worksheet[`A${index}`] || worksheet[`A${index}`].v == undefined) break;
    const name = worksheet[`A${index}`].v;
    const mark = worksheet[`B${index}`].v;
    const unit = worksheet[`C${index}`].v;
    const minPrice = worksheet[`D${index}`].v;
    const maxPrice = worksheet[`E${index}`].v;
    const averagePrice = worksheet[`F${index}`].v;
    const priceNotNoat = worksheet[`G${index}`].v;
    const type = worksheet[`H${index}`].v;

    const date = moment(worksheet[`I${index}`].v).utcOffset("+0800").format();

    if (type) {
      const typeSearch = await CostType.findOne({
        name: { $regex: ".*" + type + ".*", $options: "i" },
      });
      if (!typeSearch) {
        throw new MyError(`Тохирох ангилал алга байна ${type}`, 400);
      }
      const bodyData = {
        status: true,
        name,
        mark,
        unit,
        minPrice,
        maxPrice,
        averagePrice,
        priceNotNoat,
        type: typeSearch._id,
        createUser: req.userId,
        date,
      };

      await Cost.create(bodyData);
    }
  }
  res.status(200).json({
    success: true,
  });
});

exports.getFilterCost = asyncHandler(async (req, res) => {
  let datas = [];
  const lastElement = await Cost.findOne({}).sort({ createAt: -1 });
  let pagination = {};
  let showData = [];
  let resultData = [];
  const priceType = req.query.pricetype || "averagePrice";
  const type = req.query.type || lastElement.type[0];
  const blockType = req.query.type;
  const typeResult = await CostType.findById(type);
  const yearMin = req.query.yearMin;
  const yearMax = req.query.yearMax;
  let sort = req.query.sort || { date: -1 };
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;

  const groups = await Cost.aggregate([
    { $match: { type: { $in: [typeResult._id] } } },
    { $group: { _id: `$mark` } },
  ]);

  const groupIds = await groups.map((group) => {
    return group._id;
  });

  const success = (data, name) => {
    const i = groupIds.indexOf(name);
    resultData[i] = {
      name: name,
      data: data,
    };
  };

  const dataBuild = async () => {
    const query = Cost.find();
    if (valueRequired(blockType)) query.where("type").in(blockType);
    query.limit(500);

    if (valueRequired(sort)) {
      if (typeof sort === "string") {
        const spliteSort = sort.split(":");

        if (spliteSort[1] === "ascend") {
          sort = { [spliteSort[0]]: 1 };
        } else {
          sort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(sort);
      }
    }

    query.sort(sort);

    if (valueRequired(yearMax) && valueRequired(yearMin)) {
      query.find({
        date: { $gte: yearMin + "-01-01", $lte: yearMax + "-12-31" },
      });
    } else if (valueRequired(yearMax) && valueRequired(yearMin) === false) {
      query.find({
        date: { $lte: yearMax + "-12-31" },
      });
    } else if (valueRequired(yearMax) === false && valueRequired(yearMin)) {
      query.find({
        date: { $gte: yearMin + "-01-01" },
      });
    }

    const qc = query.toConstructor();
    const clonedQuery = new qc();
    const countQuery = new qc();
    const result = await countQuery.count();

    pagination = await paginate(page, limit, Cost, result);
    clonedQuery.populate("type");
    clonedQuery.limit(limit);
    clonedQuery.skip(pagination.start - 1);

    showData = await clonedQuery.exec();

    datas = await query.exec();

    groupIds.map(async (name) => {
      const sendData = [];
      await datas.map((data) => {
        if (data.mark === name)
          sendData.push([Date.parse(data.date), data[priceType]]);
      });
      success(sendData, name);
    });
  };

  await dataBuild();

  res.status(200).json({
    success: true,
    data: resultData,
    pagination,
    showData,
  });
});

exports.getInitData = asyncHandler(async (req, res) => {
  let resultData = [];
  const d = new Date();
  let year = d.getFullYear();
  let beforeYear = year - 1;

  const costTypeCount = await Cost.aggregate([
    {
      $group: {
        _id: "$type",
      },
    },
  ]);

  const maxPriceInitData = await Cost.aggregate([
    {
      $group: {
        _id: { type: "$type", date: "$date" },
        name: { $first: "$name" },
        id: { $first: "$_id" },
        mark: { $first: "$mark" },
        unit: { $first: "$unit" },
        date: { $first: "$date" },
        maxPrice: { $first: "$maxPrice" },
        picture: { $first: "$picture" },
        maxCost: { $max: "$maxPrice" },
        maxDate: { $max: "$date" },
      },
    },

    { $sort: { date: -1, maxPrice: -1 } },
    { $limit: costTypeCount.length },
  ]);

  const marks = maxPriceInitData.map((cost) => cost.mark);
  const costIds = maxPriceInitData.map((cost) => cost.id);

  const blockDatas = await Cost.find({})
    .where("_id")
    .in(costIds)
    .populate("type");

  const datas = await Cost.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${beforeYear.toString()}-01-01`),
          $lte: new Date(`${year.toString()}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { type: "$type", date: "$date" },
        name: { $first: "$name" },
        id: { $first: "$_id" },
        mark: { $first: "$mark" },
        unit: { $first: "$unit" },
        date: { $first: "$date" },
        maxPrice: { $first: "$maxPrice" },
        picture: { $first: "$picture" },
        maxCost: { $max: "$maxPrice" },
        maxDate: { $max: "$date" },
      },
    },

    { $sort: { date: -1, maxPrice: -1 } },
  ]);

  const success = (data, name) => {
    const i = marks.indexOf(name);
    resultData[i] = {
      name: name,
      data: data,
    };
  };

  const dataBuild = async () => {
    marks.map(async (name) => {
      const sendData = [];
      await datas.map((data) => {
        if (data.mark === name)
          sendData.push([Date.parse(data.date), data.maxCost]);
      });
      success(sendData, name);
    });
  };

  await dataBuild();

  res.status(200).json({
    success: true,
    maxCosts: blockDatas,
    data: resultData,
  });
});

exports.getTableCosts = asyncHandler(async (req, res) => {
  const costDates = await Cost.aggregate([
    { $sort: { date: -1 } },
    {
      $group: {
        _id: "$date",
      },
    },
  ]);

  const dates = costDates
    .map((d) => moment(d._id).utcOffset("+0800").format("YYYY-MM-DD"))
    .sort();

  const date = req.query.date || dates[dates.length - 1];
  const datas = await Cost.find({
    date: { $gte: date + "T00:00:00.000Z", $lte: date + "T23:59:59.999Z" },
  }).populate("type");

  res.status(200).json({
    success: true,
    dates,
    datas,
  });
});
