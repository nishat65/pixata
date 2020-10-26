const mongoose = require('mongoose');

const Post = require('./postModel');

const likeSchema = new mongoose.Schema({
    liked: {
        type: Boolean,
        default: false,
    },
    post: {
        type: mongoose.Schema.ObjectId,
    },
    user: {
        type: mongoose.Schema.ObjectId,
    },
});

likeSchema.statics.calcTotalLikes = async function (postId) {
    const totalLikes = await this.aggregate([
        {
            $match: { post: postId },
        },
        {
            $group: {
                _id: '$post',
                totalLikes: {
                    $sum: 1,
                },
            },
        },
    ]);

    console.log(totalLikes);

    // await Post.findByIdAndUpdate(postId, {
    //     liked: totalLikes[0].totalLikes,
    // });
};

likeSchema.post('save', function () {
    // this points to current review
    this.constructor.calcTotalLikes(this.post);
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
