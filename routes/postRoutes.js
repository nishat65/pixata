const express = require('express');

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication middleware
router.use(authController.protect);

// Get all posts
router.get('/', postController.getPosts);

// Get/Create post for a user
router.get('/user/:id', postController.getOthersPost);

// Search by hashtags route
router.get('/search', postController.searchPostByTags);

router
    .route('/me')
    .get(postController.getPost)
    .post(postController.uploadPostPhoto, postController.createPost);

// Update/Delete post
router
    .route('/me/:id')
    .patch(postController.updatePost)
    .delete(postController.deletePost);

module.exports = router;
