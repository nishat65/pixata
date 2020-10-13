const multer = require('multer');

const Post = require('../models/postModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const utilCntrl = require('./utilController');

// var multerStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/img/posts');
//     },
//     filename: function (req, file, cb) {
//         const originalName = file.originalname.split('.')[0];
//         const ext = file.mimetype.split('/')[1];
//         const fileName = `${originalName}-${Date.now()}.${ext}`;
//         cb(null, fileName);
//     },
// });

// const multerFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image')) {
//         cb(null, true);
//     } else {
//         cb(
//             new AppError('Not an image! Please upload only images.', 400),
//             false
//         );
//     }
// };

const { multerStorage, multerFilter } = utilCntrl.MulterUtils(
    'public/img/posts'
);

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadPostPhoto = upload.single('photo');

exports.getPosts = catchAsync(async (req, res, next) => {
    let query;
    query = Post.find().populate('reviews');

    // pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const posts = await query;
    res.status(200).json({
        status: 'success',
        results: posts.length,
        data: {
            posts,
        },
    });
});

exports.getPost = catchAsync(async (req, res, next) => {
    const post = await Post.find({ user: req.user._id }).populate('reviews');
    res.status(200).json({
        status: 'success',
        results: post.length,
        data: {
            post,
        },
    });
});

exports.createPost = catchAsync(async (req, res, next) => {
    if (req.file) req.body.photo = req.file.filename;
    if (req.user) req.body.user = req.user._id;
    const newPost = await Post.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            post: newPost,
        },
    });
});

exports.updatePost = catchAsync(async (req, res, next) => {
    const post = await utilCntrl.checkForEligibilty(Post, {
        _id: { $eq: req.params.id },
        user: { $eq: req.user._id },
    });
    if (!post.length)
        return next(
            new AppError('You are not authorized to update this post!', 401)
        );
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: {
            post: updatedPost,
        },
    });
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await utilCntrl.checkForEligibilty(Post, {
        _id: { $eq: req.params.id },
        user: { $eq: req.user._id },
    });
    if (!post.length)
        return next(
            new AppError('You are not authorized to delete this post!', 401)
        );
    await Post.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
    });
});

// controller a searched user
exports.getOtherPost = catchAsync(async (req, res, next) => {
    const searchObj = {};
    console.log(req.params.id);
    if (req.params.id) searchObj.user = req.params.id;
    const post = await Post.find({ user: searchObj.user }).populate('reviews');
    res.status(200).json({
        status: 'success',
        results: post.length,
        data: {
            post,
        },
    });
});

exports.searchPostByTerms = catchAsync(async (req, res, next) => {
    const postData = await Post.aggregate([
        {
            $project: {
                hashtags: { $split: ['$hashtags', ','] },
                description: 1,
                photo: 1,
                avgRatings: 1,
                user: 1,
            },
        },
        { $unwind: '$hashtags' },
        { $match: { hashtags: req.query.tag } },
        {
            // Like joins in SQL for multiple documents selection
            $lookup: {
                from: 'reviews',
                foreignField: 'post',
                localField: '_id',
                as: 'allReviews',
            },
        },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'user',
                as: 'currentUser',
            },
        },
    ]);
    // const post = await Post.find().populate('reviews');
    res.status(200).json({
        status: 'success',
        results: postData.length,
        data: {
            postData,
        },
    });
});
