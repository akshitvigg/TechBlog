require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var session = require("express-session");
var helmet = require("helmet");
var MongoStore = require("connect-mongo").default;
var indexRouter = require("./routes/index");

var app = express();
var isProduction = process.env.NODE_ENV === "production";

if (
  isProduction &&
  (!process.env.MONGODB_URI ||
    !process.env.SESSION_SECRET ||
    !process.env.FRONTEND_URL)
) {
  throw new Error(
    "MONGODB_URI, SESSION_SECRET, and FRONTEND_URL must be configured in production",
  );
}
if (isProduction) {
  app.set("trust proxy", 1);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "techblog-development-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/techblog",
      collectionName: "sessions",
      ttl: 60 * 60 * 8,
    }),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ error: "server error" });
});

module.exports = app;
