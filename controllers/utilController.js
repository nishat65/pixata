const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinary = require('../utils/cloudinaryConfig');

exports.cloudinaryStorage = (path) =>
    new CloudinaryStorage({
        cloudinary,
        params: {
            folder: path,
            allowedFormats: ['jpeg', 'png', 'jpg', 'gif'],
            // format: async (req, file) => 'png', // supports promises as well
            // public_id: (req, file) => 'computed-filename-using-request',
        },
    });

exports.checkForEligibilty = async (Model, condition) => {
    const model = await Model.find({
        $and: [condition],
    });
    return model;
};

// For multer config
exports.MulterUtils = (path) => {
    var multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path);
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
    return {
        multerStorage,
        multerFilter,
    };
};
