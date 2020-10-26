const express = require('express');

const likeController = require('../controllers/likeController');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication middleware
router.use(authController.protect);

router.route('/all').get(likeController.getAllLiked);

router
    .route('/me')
    .get(likeController.getUserLiked)
    .post(likeController.postLiked);

router.delete('/unlike/:id', likeController.removeLiked);

module.exports = router;
