const Like = require('../models/likeModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.postLiked = catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    const likePost = await Like.create(req.body);
    res.status(201).json({
        message: 'success',
        data: {
            likePost,
        },
    });
});
