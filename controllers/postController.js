const multer = require('multer');

const Post = require('../models/postModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

var multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/posts');
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname.split('.')[0];
        const ext = file.mimetype.split('/')[1];
        const fileName = `${originalName}-${Date.now()}.${ext}`;
        cb(null, fileName);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadPostPhoto = upload.single('photo');

exports.getPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find();
    res.status(200).json({
        status: 'success',
        data: {
            posts,
        },
    });
});

exports.getPost = catchAsync(async (req, res, next) => {
    const post = await Post.findOne({ user: req.user._id });
    console.log(post, 'post');
    res.status(200).json({
        status: 'success',
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
