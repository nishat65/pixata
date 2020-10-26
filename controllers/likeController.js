const Like = require('../models/likeModel');
const catchAsync = require('../utils/catchAsync');
const utilCntrl = require('./utilController');
const AppError = require('../utils/AppError');

exports.getAllLiked = catchAsync(async (req, res, next) => {
    const allLikes = await Like.find();
    res.status(200).json({
        message: 'success',
        results: allLikes.length,
        data: {
            allLikes,
        },
    });
});

exports.getUserLiked = catchAsync(async (req, res, next) => {
    const liked = await Like.find({ user: req.user.id });

    res.status(200).json({
        message: 'success',
        results: liked.length,
        data: {
            liked,
        },
    });
});

exports.postLiked = catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    const liked = await utilCntrl.checkForEligibilty(Like, {
        post: req.body.post,
        user: req.user.id,
        liked: { $eq: true },
    });

    if (liked.length)
        return next(new AppError("You've already liked this post!", 400));

    const likePost = await Like.create(req.body);

    res.status(201).json({
        message: 'success',
        data: {
            likePost,
        },
    });
});

exports.removeLiked = catchAsync(async (req, res, next) => {
    const liked = await utilCntrl.checkForEligibilty(Like, {
        _id: { $eq: req.params.id },
        user: { $eq: req.user._id },
    });
    if (!liked.length)
        return next(
            new AppError(
                'You are not authorized to remove this liked post!',
                401
            )
        );

    const unlikedPost = await Like.findByIdAndDelete(req.params.id);

    res.status(204).json({
        message: 'success',
        data: {
            unlikedPost,
        },
    });
});
