const express = require("express");
const router = express.Router();

const categoriesController = require("../controllers/categoriesController");
const verifyAdminToken = require("../middleware/adminAuthMiddleware");

router.get("/", categoriesController.getAllCategories);

// Khusus admin
router.post("/", verifyAdminToken, categoriesController.createCategory);
router.put("/:id", verifyAdminToken, categoriesController.updateCategory);
router.delete("/:id", verifyAdminToken, categoriesController.deleteCategory);

module.exports = router;
