const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    displayPic: {
        type: String,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    bio: {
        type: String
    },
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    this.email = this.email.toLowerCase();
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods = {
    authenticate: function (password, callback) {
        bcrypt.compare(password, this.password, (err, res) => {
            callback({res: res})
        });
    }
}

module.exports = mongoose.model('User', userSchema);