const express = require('express');
const { viewStory ,createStory, createPost, getUserPostsByUsername, getAllPostsPaginated, getAllStories } = require('../controllers/post');
const authenticateUserToken = require('../helpers/authenticateUserToken');
const router = express.Router();


router.post('/add', authenticateUserToken, createPost);
router.post('/addStory', authenticateUserToken, createStory);
// router.get('/getPosts/:userId', authenticateUserToken, getUserPosts);
router.get('/getPosts/:username', authenticateUserToken, getUserPostsByUsername);
// router.get('/getAllPosts', authenticateUserToken, getAllPosts);
router.get('/getAllPosts/:page', authenticateUserToken, getAllPostsPaginated);
router.get('/getAllStories', authenticateUserToken, getAllStories)
router.get('/viewStory/:id', authenticateUserToken, viewStory)

module.exports = router;
