const Mongoose = require('mongoose')
const Like = require('../models/like')
const Post = require('../models/post');

exports.createLike = async (req, res) => {
    let data = null

    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
        const like = new Like();
        let userData = await Like.findOne({userId: req.user.id}).session(session);
        let post = await Post.findById(req.body.postId).session(session);
        if(post) {
            if (!userData) {
                like.userId = req.user.id;
                like.posts = [req.body.postId];
                data = await Like.create([like], { session: session });
                await Post.findByIdAndUpdate(req.body.postId, {$inc: {numberOfLikes: 1}, likedBy: [...post.likedBy, req.user.id]}, {session: session});
            } else {
                if (userData.posts.includes(req.body.postId)) {
                    throw new Error('Post already liked');
                }
                data = await Like.findOneAndUpdate({userId: req.user.id}, {posts: [...userData.posts, req.body.postId]}, {session: session})
                await Post.findByIdAndUpdate(req.body.postId, {$inc: {numberOfLikes: 1}, likedBy: [...post.likedBy, req.user.id]}, {session: session})
            }
        } else {
            throw new Error('No Post Found');
        }
        await session.commitTransaction();
        return res.status(200).send(data);
    } catch (error){
        await session.abortTransaction();
        return res.status(400).send({errorMsg: error.message});
    } finally {
        session.endSession();
    }
}

exports.removeLike = async (req, res) => {
    const session = await Mongoose.startSession();
    let data = null
    session.startTransaction();
    try {
        let userData = await Like.findOne({userId: req.user.id}).session(session);;
        let postData = await Post.findById(req.body.postId).session(session);;
        if(userData.posts.length > 0 && postData){
            const indexOfPost = userData.posts.indexOf(req.body.postId);
            const indexOfLikedBy = postData.likedBy.indexOf(req.user.id);
            if (indexOfPost > -1 && indexOfLikedBy > -1) {
                userData.posts.splice(indexOfPost, 1);
                postData.likedBy.splice(indexOfLikedBy, 1);
                data = await Like.findOneAndUpdate({userId: req.user.id}, {posts: [...userData.posts]}, {session: session});
                await Post.findByIdAndUpdate(req.body.postId, {$inc: {numberOfLikes: -1}, likedBy: [...postData.likedBy]}, {session: session});
            } else {
                throw new Error('No post found')
            }
        } else {
            throw new Error('No Posts');
        }
        await session.commitTransaction();
        return res.status(200).send(data);
    } catch (error) {
        await session.abortTransaction();
        return res.status(400).send({errorMsg: error.message});
    } finally {
        session.endSession();
    }
}

exports.getAllLikes = async (req, res) => {
    // await Like.find({}).populate("posts").exec((err, data) => {
    await Like.find({}, (err, data) => {
        return err ? res.status(500).send(err) : res.status(200).send(data);
    })
}