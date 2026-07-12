const express = require("express");
const router = express.Router();

const adminAuthController = require("../controllers/adminAuthController");
const verifyAdminToken = require("../middleware/adminAuthMiddleware");

router.post("/login", adminAuthController.login);
router.get("/me", verifyAdminToken, adminAuthController.getMe);
router.post("/create", verifyAdminToken, adminAuthController.createAdmin);

module.exports = router;
