const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
        minlength: [1, 'Comment cannot be empty']
    }
}, {timestamps: true})

module.exports = mongoose.model('Comment', commentSchema);
