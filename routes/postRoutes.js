const express = require('express');
const multer = require('multer');

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication middleware
router.use(authController.protect);

// Get all posts
router.get('/', postController.getPosts);

// Get/Create post for a user
router
    .route('/me')
    .get(postController.getPost)
    .post(postController.uploadPostPhoto, postController.createPost);

module.exports = router;
