const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
var path = require("path");
var rfs = require("rotating-file-stream");
const mongoSanitize = require("express-mongo-sanitize");
const fileupload = require("express-fileupload");
const hpp = require("hpp");
var morgan = require("morgan");
const logger = require("./middleware/logger");
var cookieParser = require("cookie-parser");

// Router
const userRouters = require("./routes/Users");
const uploadRouters = require("./routes/imageUpload");
const webInfoRouters = require("./routes/WebInfo");
const newsRouters = require("./routes/News");
const newsCategoriesRouters = require("./routes/NewsCategories");
const courseRouters = require("./routes/Courses");
const initCourseRouter = require("./routes/InitCourse");
const platformRouters = require("./routes/Platform");
const serviceRouters = require("./routes/Services");
const adsRouters = require("./routes/Ads");
const partnerRouters = require("./routes/Partner");
const faqRouters = require("./routes/Faqs");
const galleryRouters = require("./routes/Gallery");
const socialLinkRouters = require("./routes/SocialLink");
const bannerRouters = require("./routes/Banners");
const adsBannerRouters = require("./routes/AdsBanner");
const menuRouters = require("./routes/Menu");
const footerRouters = require("./routes/FooterMenu");
const pageRouters = require("./routes/Pages");
const fileRouters = require("./routes/File");
const bookingRouters = require("./routes/Booking");
const employeeRouters = require("./routes/Employee");
const paytypeRouters = require("./routes/Paytype");
const productRouters = require("./routes/Product");
const qpayRouters = require("./routes/Qpay");
const orderRouters = require("./routes/Order");
const invoiceRouters = require("./routes/Invoice");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

//ROUTER IMPORT

dotenv.config({ path: "./config/config.env" });
const app = express();

connectDB();

// Манай рест апиг дуудах эрхтэй сайтуудын жагсаалт :
var whitelist = [
  "http://localhost:3000",
  "http://localhost:8989",
  "http://localhost:3001",

  "http://zaya-ananda.com",
  "http://www.zaya-ananda.com",
  "http://admin.zaya-ananda.com",
  "http://www.admin.zaya-ananda.com",

  "https://zaya-ananda.com",
  "https://www.zaya-ananda.com",
  "https://admin.zaya-ananda.com",
  "https://www.admin.zaya-ananda.com",
];

// Өөр домэйн дээр байрлах клиент вэб аппуудаас шаардах шаардлагуудыг энд тодорхойлно
var corsOptions = {
  // Ямар ямар домэйнээс манай рест апиг дуудаж болохыг заана
  origin: function (origin, callback) {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      // Энэ домэйнээс манай рест рүү хандахыг зөвшөөрнө
      callback(null, true);
    } else {
      // Энэ домэйнд хандахыг хориглоно.
      callback(new Error("Хандах боломжгүй."));
    }
  },
  // Клиент талаас эдгээр http header-үүдийг бичиж илгээхийг зөвшөөрнө
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  // Клиент талаас эдгээр мэссэжүүдийг илгээхийг зөвөөрнө
  methods: "GET, POST, PUT, DELETE",
  // Клиент тал authorization юмуу cookie мэдээллүүдээ илгээхийг зөвшөөрнө
  credentials: true,
};

app.use("/uploads", express.static("public/upload"));
// Cookie байвал req.cookie рүү оруулж өгнө0
app.use(cookieParser());
// Өөр өөр домэйнтэй вэб аппуудад хандах боломж өгнө
app.use(cors(corsOptions));
// логгер
app.use(logger);
// Body дахь өгөгдлийг Json болгож өгнө
app.use(express.json());

// Клиент вэб аппуудыг мөрдөх ёстой нууцлал хамгаалалтыг http header ашиглан зааж өгнө
app.use(helmet());
// клиент сайтаас ирэх Cross site scripting халдлагаас хамгаална
app.use(xss());
// Клиент сайтаас дамжуулж буй MongoDB өгөгдлүүдийг халдлагаас цэвэрлэнэ
app.use(mongoSanitize());
// Сэрвэр рүү upload хийсэн файлтай ажиллана
app.use(fileupload());
// http parameter pollution халдлагын эсрэг books?name=aaa&name=bbb  ---> name="bbb"
app.use(hpp());

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});
app.use(morgan("combined", { stream: accessLogStream }));

// REST API RESOURSE
app.use("/api/v1/users", userRouters);
app.use("/api/v1/lessons", courseRouters);
app.use("/api/v1/initcourses", initCourseRouter);
app.use("/api/v1/news", newsRouters);
app.use("/api/v1/platforms", platformRouters);
app.use("/api/v1/webinfo", webInfoRouters);
app.use("/api/v1/news-categories", newsCategoriesRouters);
app.use("/api/v1/imgupload", uploadRouters);
app.use("/api/v1/services", serviceRouters);
app.use("/api/v1/adsies", adsRouters);
app.use("/api/v1/employees", employeeRouters);
app.use("/api/v1/partners", partnerRouters);
app.use("/api/v1/paytypes", paytypeRouters);
app.use("/api/v1/faqs", faqRouters);
app.use("/api/v1/gallerys", galleryRouters);
app.use("/api/v1/slinks", socialLinkRouters);
app.use("/api/v1/bookings", bookingRouters);
app.use("/api/v1/banners", bannerRouters);
app.use("/api/v1/adsbanners", adsBannerRouters);
app.use("/api/v1/menus", menuRouters);
app.use("/api/v1/footermenus", footerRouters);
app.use("/api/v1/payment", qpayRouters);
app.use("/api/v1/orders", orderRouters);
app.use("/api/v1/pages", pageRouters);
app.use("/api/v1/file", fileRouters);
app.use("/api/v1/products", productRouters);
app.use("/api/v1/invoices", invoiceRouters);
app.use(errorHandler);
// Алдаа үүсэхэд барьж авч алдааны мэдээллийг клиент тал руу автоматаар мэдээлнэ

// express сэрвэрийг асаана.
const server = app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} порт дээр аслаа....`)
);

// Баригдалгүй цацагдсан бүх алдаануудыг энд барьж авна
process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
