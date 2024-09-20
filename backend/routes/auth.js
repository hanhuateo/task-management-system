const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const usersController = require('../controllers/usersControllers');
const groupController = require('../controllers/groupControllers');
const authMiddle = require('../middlewares/authMiddle');

// login/logout routes
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// users routes
router.get('/getAllUsersDetails', authMiddle.verifyToken, usersController.getAllUsersDetails);
router.get('/getUserDetails', authMiddle.verifyToken, usersController.getUserDetails);
router.post('/createNewUser', authMiddle.verifyToken, usersController.createNewUser);
router.patch('/updateUserEmail', authMiddle.verifyToken, usersController.updateUserEmail);
router.patch('/updateUserPassword', authMiddle.verifyToken, usersController.updateUserPassword);
router.patch('/adminUpdateUserStatus', authMiddle.verifyToken, usersController.adminUpdateUserStatus);
router.patch('/adminUpdateUserGroup', authMiddle.verifyToken, usersController.adminUpdateUserGroup);
router.patch('/adminUpdateUserEmail', authMiddle.verifyToken, usersController.adminUpdateUserEmail);
router.patch('/adminUpdateUserPassword', authMiddle.verifyToken, usersController.adminUpdateUserPassword);

// group routes
router.post("/createNewGroup", authMiddle.verifyToken, groupController.createNewGroup);
router.get("/getAllUserGroup", authMiddle.verifyToken, groupController.getAllUserGroup);
router.get("/getUserGroup", authMiddle.verifyToken, groupController.getUserGroup);

// app routes

module.exports = router;