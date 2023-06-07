const Employee = require("../models/Employee");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { RegexOptions, useServiceSearch } = require("../lib/searchOfterModel")

exports.createEmployee = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || true;

  const employee = await Employee.create(req.body);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getEmployees = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // DATA FIELDS
  const status = req.query.status;
  const lastName = req.query.lastName;
  const firstName = req.query.firstName;
  const position = req.query.position;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Employee.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if(valueRequired(lastName)){
    query.find({lastName: RegexOptions(lastName)})
  }

  if(valueRequired(firstName)){
    query.find({firstName: RegexOptions(firstName)})
  }

  if(valueRequired(position)){
    query.find({position: RegexOptions(position)})
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

  const pagination = await paginate(page, limit, Employee, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const employee = await query.exec();

  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;
  let sort = req.query.sort || { createAt: -1 };

  // DATA FIELDS
  const status = req.query.status;
  const lastName = req.query.lastName;
  const firstName = req.query.firstName;
  const position = req.query.position;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Employee.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if(valueRequired(lastName)){
    query.find({lastName: RegexOptions(lastName)})
  }

  if(valueRequired(firstName)){
    query.find({firstName: RegexOptions(firstName)})
  }

  if(valueRequired(position)){
    query.find({position: RegexOptions(position)})
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
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Employee, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const employee = await query.exec();

  return employee;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

   // DATA FIELDS
   const status = req.query.status;
   const lastName = req.query.lastName;
   const firstName = req.query.firstName;
   const position = req.query.position;
   const createUser = req.query.createUser;
   const updateUser = req.query.updateUser;
 
   const query = Employee.find();
 
   if (valueRequired(status)) {
     if (status.split(",").length > 1) {
       query.where("status").in(status.split(","));
     } else query.where("status").equals(status);
   }
 
   if(valueRequired(lastName)){
     query.find({lastName: RegexOptions(lastName)})
   }
 
   if(valueRequired(firstName)){
     query.find({firstName: RegexOptions(firstName)})
   }
 
   if(valueRequired(position)){
     query.find({position: RegexOptions(position)})
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
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();
  const pagination = await paginate(page, limit, Employee, result);
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

exports.multDeleteEmployee = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findEmployees = await Employee.find({ _id: { $in: ids } });

  if (findEmployees.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөлүүд олдсонгүй", 400);
  }


  await Employee.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id).populate('createUser').populate('updateUser'); 


  if (!employee) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

 
  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getCountEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.count();
  res.status(200).json({
    success: true,
    data: employee,
  });
});
