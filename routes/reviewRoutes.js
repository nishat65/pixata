const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// Getting/Posting reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.createReview);

// Updating/Deleting reviews
router
    .route('/:id')
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

module.exports = router;
