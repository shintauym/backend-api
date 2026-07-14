const express = require("express");
const router = express.Router();

const adminOrderController = require("../controllers/adminOrderController");
const verifyAdminToken = require("../middleware/adminAuthMiddleware");

router.use(verifyAdminToken);

router.get("/", adminOrderController.getAllOrders);
router.get("/:id", adminOrderController.getOrderById);
router.put("/:id/status", adminOrderController.updateOrderStatus);

module.exports = router;
