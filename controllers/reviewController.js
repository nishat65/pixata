const Review = require('../models/reviewModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const review = await Review.find();
    res.status(200).json({
        message: 'success',
        results: review.length,
        data: {
            review,
        },
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    req.body.user = req.user._id;
    const newReview = await Review.create(req.body);
    res.status(201).json({
        message: 'success',
        data: {
            review: newReview,
        },
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
        message: 'success',
        data: {
            review: newReview,
        },
    });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    await Review.findByIdAndDelete(req.params.id);
    res.status(204).json({
        message: 'success',
    });
});
