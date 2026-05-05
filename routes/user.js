const express = require("express");
const { listenerCount } = require("../models/review");
const User = require("../models/user.js");
const router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userscontroller = require("../controllers/users.js");

router
  .route("/signup")
  .get(userscontroller.renderSignupForm)
  .post(wrapAsync(userscontroller.signup));

router
  .route("/login")
  .get(userscontroller.renderLoginForm)
  .post(
    saveredirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userscontroller.login,
  );

router.get("/logout", userscontroller.logout);

module.exports = router;
