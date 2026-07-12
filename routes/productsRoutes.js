const express = require("express");
const router = express.Router();

const productsController = require("../controllers/productsController");
const verifyAdminToken = require("../middleware/adminAuthMiddleware");

router.get("/", productsController.getAllProducts);
router.get("/:id", productsController.getProductById);

// Khusus admin
router.post("/", verifyAdminToken, productsController.createProduct);
router.put("/:id", verifyAdminToken, productsController.updateProduct);
router.delete("/:id", verifyAdminToken, productsController.deleteProduct);

module.exports = router;
