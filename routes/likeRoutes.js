const express = require('express');

const likeController = require('../controllers/likeController');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication middleware
router.use(authController.protect);

router.post('/liked', likeController.postLiked);

module.exports = router;
