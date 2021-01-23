const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }]
}, { timestamps: true })

module.exports = mongoose.model('Like', likeSchema);