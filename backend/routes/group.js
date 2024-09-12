const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupControllers');
const authMiddle = require('../middlewares/authMiddle');

router.post("/createNewGroup", authMiddle.verifyToken, groupController.createNewGroup);
router.get("/getAllUserGroup", authMiddle.verifyToken, groupController.getAllUserGroup);
router.get("/getUserGroup", authMiddle.verifyToken, groupController.getUserGroup);
module.exports = router