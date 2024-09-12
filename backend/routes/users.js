const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersControllers');
const authMiddle = require('../middlewares/authMiddle');

router.get('/getAllUsersDetails', authMiddle.verifyToken, userController.getAllUsersDetails);
router.get('/getUserDetails', authMiddle.verifyToken, userController.getUserDetails);
router.post('/createNewUser', authMiddle.verifyToken, userController.createNewUser);
router.put('/updateUserEmail', authMiddle.verifyToken, userController.updateUserEmail);
router.put('/updateUserPassword', authMiddle.verifyToken, userController.updateUserPassword);
router.put('/updateUserStatus', authMiddle.verifyToken, userController.updateUserStatus);
router.put('/updateUserGroup', authMiddle.verifyToken, userController.updateUserGroup);
module.exports = router;