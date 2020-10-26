const mongoose = require('mongoose');
const validator = require('validator');

const postSchema = new mongoose.Schema(
    {
        //local system storage
        photo: {
            type: String,
            required: [true, 'Please upload a photo!'],
        },
        //for cloundinary storage
        // photoName: {
        //     type: String,
        //     required: [true, 'Please upload a photo!'],
        // },
        // photoUrl: {
        //     type: String,
        //     required: [true, 'Please upload a photo!'],
        // },
        description: {
            type: String,
        },
        avgRatings: {
            type: Number,
            default: 0,
        },
        hashtags: String,
        createdAt: Date,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
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
        select: 'username firstname lastname photo',
    });
    next();
});

// Virtual populate
postSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'post',
    localField: '_id',
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

// accidental global variable;
// automatic semi colon
// Length trim
