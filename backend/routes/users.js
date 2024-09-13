const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersControllers');
const authMiddle = require('../middlewares/authMiddle');

router.get('/getAllUsersDetails', authMiddle.verifyToken, userController.getAllUsersDetails);
router.post('/getUserDetails', authMiddle.verifyToken, userController.getUserDetails);
router.post('/createNewUser', authMiddle.verifyToken, userController.createNewUser);
router.patch('/updateUserEmail', authMiddle.verifyToken, userController.updateUserEmail);
router.patch('/updateUserPassword', authMiddle.verifyToken, userController.updateUserPassword);
router.patch('/updateUserStatus', authMiddle.verifyToken, userController.updateUserStatus);
router.patch('/updateUserGroup', authMiddle.verifyToken, userController.updateUserGroup);
module.exports = router;