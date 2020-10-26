const multer = require('multer');

const Post = require('../models/postModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const utilCntrl = require('./utilController');

// FOR LOCAL SYSTEM STORAGE
const { multerStorage, multerFilter } = utilCntrl.MulterUtils(
    'public/img/posts'
);
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
// ----------

// FOR CLOUDINARY STORAGE
// const storage = utilCntrl.cloudinaryStorage('Pixata_User');
// const upload = multer({ storage });
// ----------

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

exports.getOthersPost = catchAsync(async (req, res, next) => {
    const searchObj = {};
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

exports.searchPostByTags = catchAsync(async (req, res, next) => {
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
            // Like joins in SQL for multiple collections selection
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
        {
            $unwind: '$currentUser',
        },
        {
            $project: {
                'currentUser._id': 0,
                'currentUser.password': 0,
                'currentUser.passwordChangedAt': 0,
                'currentUser.createdAt': 0,
                'currentUser._v': 0,
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        results: postData.length,
        data: {
            postData,
        },
    });
});
