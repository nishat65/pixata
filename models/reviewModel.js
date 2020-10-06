const mongoose = require('mongoose');
const Post = require('./postModel');

const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        comments: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        post: {
            type: mongoose.Schema.ObjectId,
            ref: 'Post',
            required: [true, 'Review must belong to a Post'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'username photo',
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (postId) {
    const stats = await this.aggregate([
        {
            $match: { post: postId },
        },
        {
            $group: {
                _id: '$post',
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    await Post.findByIdAndUpdate(postId, {
        avgRatings: stats[0].avgRating,
    });
};

reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.post);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
