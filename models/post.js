const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        type: String,
        // required: true,
    },
    caption: {
        type: String,
        default: null
    },
    numberOfLikes: {
        type: Number,
        default: 0,
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]

}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema);
