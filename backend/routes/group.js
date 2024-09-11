const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupControllers')

router.post("/createNewGroup", groupController.createNewGroup);
router.get("/getAllUserGroup", groupController.getAllUserGroup);
router.get("/getUserGroup", groupController.getUserGroup);
module.exports = router