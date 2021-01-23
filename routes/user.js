const express = require('express');
const { signin, signup, changeDP, getUserData, updateUserDetails, changePassword } = require('../controllers/user');
const authenticateUserToken = require('../helpers/authenticateUserToken');

const router = express.Router();

router.post('/signin', signin)
router.post('/signup', signup)
router.post('/updateUserDetails', authenticateUserToken, updateUserDetails)
router.post('/changePassword', authenticateUserToken, changePassword)
router.post('/changeDisplayPic', authenticateUserToken, changeDP)
router.get('/getUserData/:username', authenticateUserToken, getUserData)

module.exports = router;
