const express = require('express');
const { createLike, removeLike, getAllLikes } = require('../controllers/like');
const authenticateUserToken = require('../helpers/authenticateUserToken');
const router = express.Router();

router.post('/add', authenticateUserToken, createLike);
router.post('/remove', authenticateUserToken, removeLike);
router.get('/getAllLikes', authenticateUserToken, getAllLikes);

module.exports = router;
