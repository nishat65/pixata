const mongoose = require('mongoose');
const validator = require('validator');

const postSchema = new mongoose.Schema(
    {
        photo: {
            type: String,
            required: [true, 'Please upload a photo!'],
        },
        description: {
            type: String,
        },
        hashtags: String,
        createdAt: Date,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

postSchema.pre('save', function (next) {
    this.createdAt = new Date();
    next();
});

postSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'username firstname lastname',
    });
    next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

// accidental global variable;
// automatic semi colon
// Length trim
