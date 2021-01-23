const Mongoose = require('mongoose');
const Comment = require('../models/comment');
const Post = require('../models/post');

exports.addComment = async (req, res) => {
    let userId = req.user.id;
    let {postId, comment} = req.body;

    const session = await Mongoose.startSession();
    session.startTransaction();
    try{
        let _comment = new Comment(req.body);
        _comment.userId = userId;
        let comment = await Comment.create([_comment], { session: session })
        let data = await Comment.populate(comment[0], {path: 'userId', select: 'username'});
        await Post.findByIdAndUpdate(postId, {$push: {comments: comment[0]._id}}, {session: session});
        await session.commitTransaction();
        return res.status(200).send(data);
    } catch (err) {
        await session.abortTransaction();
        return res.status(400).send({errorMsg: error.message});
    } finally {
        session.endSession()
    }
}


// exports.removeComment = async(req, res) => {
//     let {commentId} = req.body;
//     Comment.findByIdAndRemove(commentId, (err, data) => {
//         return err ? res.status(500).send(err) : res.status(201).send(data);
//     });
// }