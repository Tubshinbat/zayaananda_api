const CostType = require("../models/CostType");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { imageDelete } = require("../lib/photoUpload");

exports.createCostType = asyncHandler(async (req, res, next) => {
  const parentId = req.body.parentId || null;
  let position = 0;
  if (parentId) {
    const category = await CostType.findOne({ parentId }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  } else {
    const category = await CostType.findOne({ parentId: null }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  }
  req.body.position = position;

  const category = await CostType.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

function createCostType(categories, parentId = null) {
  const categoryList = [];
  let category = null;

  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      position: cate.position,
      children: createCostType(categories, cate._id),
    });
  }

  return categoryList;
}

exports.getCostTypes = asyncHandler(async (req, res, next) => {
  CostType.find({})
    .sort({ position: 1 })
    .exec((error, categories) => {
      if (error)
        return res.status(400).json({
          success: false,
          error,
        });
      if (categories) {
        const categoryList = createCostType(categories);

        res.status(200).json({
          success: true,
          data: categoryList,
        });
      }
    });
});

exports.getCostType = asyncHandler(async (req, res, next) => {
  const costType = await CostType.findById(req.params.id);

  if (!costType) {
    throw new MyError(req.params.id + " Тус ангилал олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: costType,
  });
});

const parentCheck = (menus) => {
  menus.map(async (menu) => {
    const result = await CostType.find({ parentId: menu._id });
    if (result && result.length > 0) {
      parentCheck(result);
    }
    await CostType.findByIdAndDelete(menu._id);
  });
};

exports.deleteCostType = asyncHandler(async (req, res, next) => {
  const category = await CostType.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ангилал олдсонгүй", 404);
  }
  const parentMenus = await CostType.find({ parentId: req.params.id });

  if (parentMenus) {
    parentCheck(parentMenus);
  }

  if (category.picture) {
    category.picture && (await imageDelete(category.picture));
  }
  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.changePosition = asyncHandler(async (req, res) => {
  menus = req.body.data;

  if (!menus && menus.length > 0) {
    throw new MyError("Дата илгээгүй байна дахин шалгана уу", 404);
  }

  const positionChange = (categories, pKey = null) => {
    if (categories) {
      categories.map(async (el, index) => {
        const data = {
          position: index,
          parentId: pKey,
        };
        await CostType.findByIdAndUpdate(el.key, data);
        if (el.children && el.children.length > 0) {
          const parentKey = el.key;
          positionChange(el.children, parentKey);
        }
      });
    }
  };

  positionChange(menus);

  res.status(200).json({
    success: true,
  });

  // const info = req.body.info;
  // let parentId = null;
  // let position = dropPosition || 0;

  // const { dragNode, dropPosition, node } = info;

  // const category = await CostType.findById(dragNode.key);
  // if (!category) {
  //   throw new MyError("Ангилал олдсонгүй.", 404);
  // }

  // const { dragOver, dragOverGapBottom, dragOverGapTop } = node;

  // if (dragOver == true) {
  //   parentId = node.key;
  //   position = dropPosition || 0;
  //   const result = await CostType.find({ parentId: node.key });
  //   if (result && result.length > 0) {
  //     result.map(async (el) => {
  //       const data = {
  //         position: el.position + 1,
  //       };
  //       await CostType.findByIdAndUpdate(el._id, data);
  //     });
  //   }
  // }

  // if (dropPosition == -1) {
  //   parentId = null;
  //   position = 0;
  //   const parentMenus = await CostType.find({ parentId: null });
  //   if (parentMenus && parentMenus.length > 0) {
  //     parentMenus.map(async (menu) => {
  //       const position = menu.position + 1;
  //       const data = {
  //         position,
  //       };
  //       await CostType.findByIdAndUpdate(menu._id, data);
  //     });
  //   }
  // }

  // if (dragOverGapBottom == true || dragOverGapTop == true || expanded == true) {
  //   const category = await CostType.findById(node.key);
  //   parentId = category.parentId;

  //   if (dragOverGapBottom == true) {
  //     const bottomNode = await CostType.findById(node.key);
  //     const result = await CostType.find({
  //       position: { $gte: bottomNode.position },
  //     })
  //       .where("parentId")
  //       .equals(bottomNode.parentId);

  //     if (result && result.length > 0) {
  //       result.map(async (el) => {
  //         const position = el.position + 1;
  //         const data = {
  //           position,
  //         };
  //         await CostType.findByIdAndUpdate(el._id, data);
  //       });
  //     }
  //   }
  // }

  // const data = {
  //   position,
  //   parentId,
  // };

  // const updateData = await CostType.findByIdAndUpdate(dragNode.key, data);
});

exports.updateCostType = asyncHandler(async (req, res, next) => {
  const category = await CostType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new MyError("Ангилалын нэр солигдсонгүй", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});
