const mongoose = require('mongoose');

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

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
