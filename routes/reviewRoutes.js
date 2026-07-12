const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/product/:productId", reviewController.getProductReviews);
router.get("/me", verifyToken, reviewController.getMyReviews);
router.post("/", verifyToken, reviewController.createReview);
router.put("/:id", verifyToken, reviewController.updateReview);

module.exports = router;
