const User = require("../models/User");
const NewsCategories = require("../models/NewsCategories");
const InitCourse = require("../models/InitCourse");
const Page = require("../models/Page");
const Menu = require("../models/Menu");
const FooterMenu = require("../models/FooterMenu");

exports.userSearch = async (name) => {
  const userData = await User.find({
    firstname: { $regex: ".*" + name + ".*", $options: "i" },
  }).select("_id");
  return userData;
};

exports.useNewsCategorySearch = async (name) => {
  const newsCategories = await NewsCategories.find({
    name: this.RegexOptions(name),
  }).select("_id");
  return newsCategories;
};

exports.useInitCourse = async (name) => {
  const initCourses = await initCourses
    .find({
      name: this.RegexOptions(name),
    })
    .select("_id");
  return initCourses;
};

exports.usePageSearch = async (name) => {
  const pages = await Page.find({
    name: this.RegexOptions(name),
  }).select("_id");
  return pages;
};

exports.useMenuSearch = async (name) => {
  const menus = await Menu.find({
    name: this.RegexOptions(name),
  }).select("_id");

  return menus;
};

exports.useFooterMenuSearch = async (name) => {
  const footerMenus = await FooterMenu.find({
    name: this.RegexOptions(name),
  }).select("_id");

  return footerMenus;
};

exports.RegexOptions = (name) => {
  const regexNameSearch = { $regex: ".*" + name + ".*", $options: "i" };
  return regexNameSearch;
};
