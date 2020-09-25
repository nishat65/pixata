const express = require('express');

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', postController.getAllPosts);

router.use(authController.protect);

router
    .route('/me')
    .get(postController.getPosts)
    .post(postController.createPost);

module.exports = router;
