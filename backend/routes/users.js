const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersControllers');
const authMiddle = require('../middlewares/authMiddle');

router.get('/getAllUsersDetails', userController.getAllUsersDetails);
router.get('/getUserDetails', userController.getUserDetails);
router.post('/createNewUser', authMiddle.verifyToken, userController.createNewUser);
router.put('/updateUserEmail', userController.updateUserEmail);
router.put('/updateUserPassword', userController.updateUserPassword);
router.put('/updateUserStatus', userController.updateUserStatus);
router.put('/updateUserGroup', userController.updateUserGroup);
module.exports = router;