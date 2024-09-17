const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersControllers');
const authMiddle = require('../middlewares/authMiddle');

router.get('/getAllUsersDetails', authMiddle.verifyToken, userController.getAllUsersDetails);
router.get('/getUserDetails', authMiddle.verifyToken, userController.getUserDetails);
router.post('/createNewUser', authMiddle.verifyToken, userController.createNewUser);
router.patch('/updateUserEmail', authMiddle.verifyToken, userController.updateUserEmail);
router.patch('/updateUserPassword', authMiddle.verifyToken, userController.updateUserPassword);
router.patch('/adminUpdateUserStatus', authMiddle.verifyToken, userController.adminUpdateUserStatus);
router.patch('/adminUpdateUserGroup', authMiddle.verifyToken, userController.adminUpdateUserGroup);
router.patch('/adminUpdateUserEmail', authMiddle.verifyToken, userController.adminUpdateUserEmail);
router.patch('/adminUpdateUserPassword', authMiddle.verifyToken, userController.adminUpdateUserPassword);

module.exports = router;