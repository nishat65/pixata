const multer = require('multer');

const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const utilCntrl = require('./utilController');
const factory = require('../utils/factoryFunctions');

const { multerStorage, multerFilter } = utilCntrl.MulterUtils(
    'public/img/users'
);

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadPostPhoto = upload.single('photo');

function filterObj(obj, ...allowedFields) {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const fields = factory.filtered(
        '-createdAt',
        '-passwordChangedAt',
        '-email',
        '-firstname',
        '-lastname',
        '-__v'
    );
    // const allUsers = await User.find({
    //     $text: { $search: req.query.name, $language: 'en' },
    // }).select(fields);
    let allUsers;
    if (req.query.username) {
        allUsers = await User.find({
            username: { $regex: req.query.username, $options: 'i' },
        }).select(fields);
    } else {
        allUsers = await User.find().select(fields);
    }

    res.status(200).json({
        status: 'success',
        data: {
            allUsers,
        },
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('No data found with that ID!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(
        req.body,
        'firstname',
        'lastname',
        'username',
        'email'
    );

    if (req.file) filteredBody.photo = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            data: user,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
