const express = require('express');
const multer = require('multer');

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', postController.getPosts);

router.use(authController.protect);

router
    .route('/me')
    .get(postController.getPost)
    .post(postController.uploadPostPhoto, postController.createPost);

module.exports = router;
