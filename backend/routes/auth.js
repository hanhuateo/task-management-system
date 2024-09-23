const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const usersController = require('../controllers/usersControllers');
const groupController = require('../controllers/groupControllers');
const appController = require('../controllers/appControllers');
const taskController = require('../controllers/taskController');
const planController = require('../controllers/planController');
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
router.post("/createNewApp", authMiddle.verifyToken, appController.createNewApp);
router.get("/getAllPartialAppDetails", authMiddle.verifyToken, appController.getAllPartialAppDetails);
router.get("/getFullAppDetails", authMiddle.verifyToken, appController.getFullAppDetails);
router.patch("/updateApp", authMiddle.verifyToken, appController.updateApp);

// plan routes
router.post("/createPlan", authMiddle.verifyToken, planController.createPlan);
router.get("/getAllPlanMVPName", authMiddle.verifyToken, planController.getAllPlanMVPName);
router.get("/getPlanDetails", authMiddle.verifyToken, planController.getPlanDetails);
router.patch("/updatePlanDetails", authMiddle.verifyToken, planController.updatePlanDetails);

// task routes
router.get("/getAllPartialTaskDetails", authMiddle.verifyToken, taskController.getAllPartialTaskDetails);
router.get("/getFullTaskDetails", authMiddle.verifyToken, taskController.getFullTaskDetails);
router.post("/createTask", authMiddle.verifyToken, taskController.createTask);
router.get("/getTaskByState", authMiddle.verifyToken, taskController.getTaskByState);
router.patch("/promoteTaskOpen2Todo", authMiddle.verifyToken, taskController.promoteTaskOpen2Todo);

module.exports = router;