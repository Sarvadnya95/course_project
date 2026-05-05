const express = require("express");
const app = express();
const router = express.Router();
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../util/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingscontroller = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//index route

router
  .route("/")
  .get(wrapAsync(listingscontroller.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingscontroller.create),
  );

//new route
router.get("/new", isLoggedIn, listingscontroller.renderNewForm);

//show route
router
  .route("/:id")
  .get(wrapAsync(listingscontroller.show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingscontroller.update),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingscontroller.destroyListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingscontroller.renderEditForm),
);

module.exports = router;
