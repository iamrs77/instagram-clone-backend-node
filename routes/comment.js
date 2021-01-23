const express = require('express');
const { addComment } = require('../controllers/comment');
const authenticateUserToken = require('../helpers/authenticateUserToken');

let router = express.Router();

router.post('/add', authenticateUserToken, addComment);
// router.delete('/remove', authenticateUserToken, removeComment);

module.exports = router;