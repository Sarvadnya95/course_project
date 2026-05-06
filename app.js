if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./util/ExpressError.js");
const MongoStore = require("connect-mongo").default;
const expressSession = require("express-session");
const util = require("util");
if (typeof util.isArray === "function") util.isArray = Array.isArray;
const flash = require("connect-flash");
const user = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const usersrouter = require("./routes/user.js");


const dbUrl = process.env.ATLAS_URI || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

const store = new MongoStore({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // time period in seconds
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(expressSession(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingrouter);
app.use("/listings/:id/reviews", reviewrouter);
app.use("/", usersrouter);
