const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../util/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../util/ExpressError.js");
const { validateReview, isLoggedIn ,isReviewAuthor} = require("../middleware.js");
const reviewscontroller = require("../controllers/reviews.js");

//create review route 

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewscontroller.create),
);

//delete review route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewscontroller.delete),
);

  

module.exports = router;
