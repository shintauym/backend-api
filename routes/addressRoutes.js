const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", addressController.getAddresses);
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.put("/:id/default", addressController.setDefaultAddress);
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
