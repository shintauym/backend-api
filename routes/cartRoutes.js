const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:cartItemId", cartController.updateCartItem);
router.delete("/:cartItemId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);

module.exports = router;
