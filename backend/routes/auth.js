const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const authMiddle = require('../middlewares/authMiddle');

// login/logout routes
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// users routes
router.get('/getAllUsersDetails', authMiddle.verifyToken, authController.getAllUsersDetails);
router.get('/getUserDetails', authMiddle.verifyToken, authController.getUserDetails);
router.post('/createNewUser', authMiddle.verifyToken, authController.createNewUser);
router.patch('/updateUserEmail', authMiddle.verifyToken, authController.updateUserEmail);
router.patch('/updateUserPassword', authMiddle.verifyToken, authController.updateUserPassword);
router.patch('/adminUpdateUserStatus', authMiddle.verifyToken, authController.adminUpdateUserStatus);
router.patch('/adminUpdateUserGroup', authMiddle.verifyToken, authController.adminUpdateUserGroup);
router.patch('/adminUpdateUserEmail', authMiddle.verifyToken, authController.adminUpdateUserEmail);
router.patch('/adminUpdateUserPassword', authMiddle.verifyToken, authController.adminUpdateUserPassword);

// group routes
router.post("/createNewGroup", authMiddle.verifyToken, authController.createNewGroup);
router.get("/getAllUserGroup", authMiddle.verifyToken, authController.getAllUserGroup);
router.get("/getUserGroup", authMiddle.verifyToken, authController.getUserGroup);

module.exports = router;