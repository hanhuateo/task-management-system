const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const authMiddle = require('../middlewares/authMiddle');

router.post("/login", authController.login);
router.post("/logout", authController.logout);
module.exports = router;