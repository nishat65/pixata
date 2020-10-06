const multer = require('multer');

const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

var multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/users');
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

function filterObj(obj, ...allowedFields) {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
}

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('No data found with that ID!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            data: user,
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
