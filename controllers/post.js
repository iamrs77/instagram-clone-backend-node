const Post = require('../models/post')
const Story = require('../models/story')
const User = require('../models/user')
const upload = require('../helpers/file-upload')
const Mongoose = require('mongoose')
const { populate } = require('../models/story')

const singleUpload = upload.single('image')

exports.createPost = async (req, res) => {
    singleUpload(req, res, async function(err){
        if(err){
            res.status(422).send({
                error: err.message 
            })
        }
        const session = await Mongoose.startSession();
        session.startTransaction()
        try{
            let post = new Post({
                userId: req.user.id,
                image: req.file.location,
                caption: req.body.caption? req.body.caption: "",
            })
            post = await Post.create([post], { session: session });
            let user = await User.findById(req.user.id).session(session);
            if(!user){
                throw new Error('Invalid user')
            }
            await User.findByIdAndUpdate(req.user.id, {posts: [...user.posts, post[0]._id]}).session(session);
            await session.commitTransaction()
            return res.status(200).send(post)
        }catch(err){
            await session.abortTransaction()
            return res.status(400).send({errorMsg: err.message})
        }finally{
            session.endSession()
        }
    })
}

exports.createStory = async (req, res) => {
    singleUpload(req, res, async function(err){
        if(err){
            res.status(422).send({
                error: err.message 
            })
        }
        const session = await Mongoose.startSession()
        session.startTransaction()
        try{
            let story = new Story({
                userId: req.user.id,
                image: req.file.location,
                viewedBy: []
            })
            story = await Story.create([story], { session: session })
            let user = await User.findById(req.user.id).session(session)
            if(!user){
                throw new Error('Invalid User')
            }
            if(user.story){
                await Story.findByIdAndDelete(user.story)
            }
            await User.findByIdAndUpdate(req.user.id, {story: story[0]._id}).session(session)
            await session.commitTransaction()
            return res.status(200).send(story)
        }catch(err){
            console.log(err.message)
            await session.abortTransaction()
            return res.status(400).send({errorMsg: err.message})
        }finally{
            session.endSession()
        }
    })
}

exports.getUserPosts = async (req, res) => {
    const userId = req.params.userId;
    await Post.find({userId}, (err, data) => {
        return err ? res.status(500).send(err) : res.status(200).send(data);
    })
}

exports.getUserPostsByUsername = async (req, res) => {
    const username = req.params.username
    try{
        const user = await User.find({username}).populate('posts')
        const posts = user[0].posts
        res.status(200).send(posts)
    }catch(err){
        res.status(500).send({err: 'Something went wrong.'})
    }
}

exports.getAllPosts = async (req, res) => {
    await Post.find({}).limit(10).sort({createdAt: -1}).populate('userId').exec((err, data) => {
        return err ? res.status(500).send(err) : res.status(200).send(data);
    })
}

exports.getAllStories = async (req, res) => {
    let date = new Date(new Date().getTime() - (24 * 60 * 60 * 1000))
    await Story.find({createdAt: { "$gte": date }}).sort({createdAt: -1})
    .populate({path: 'userId', select: 'username displayPic'})
    .exec((err, data) => {
        return err ? res.status(500).send(err) : res.status(200).send(data)
    })
}

exports.getAllPostsPaginated = async (req, res) => {
    try{
        let perPage = 5
        let page = (Math.abs(req.params.page) || 1) - 1
        const posts = await Post.find({})
            .populate({path: 'userId', select: 'username displayPic'})
            .populate({path: 'comments', select: 'comment', populate: {path: 'userId', select: 'username'}, options: {limit: 2, sort: {createdAt: -1}}})
            .limit(perPage)
            .skip(perPage*page)
            .sort({createdAt:-1})
        return res.status(200).send(posts)
    }catch(err){
        res.status(500).send(err.message)
    }
}

exports.viewStory = async (req, res) => {
    const storyId = req.params.id
    if(!storyId){
        return res.status(401).send({errorMsg: 'No such story available.'})
    }
    try{
        let story = await Story.findById(storyId)
        if(!story){
            throw  new Error('No such story found')
        }
        if(story.viewedBy.includes(req.user.id)){
            return res.status(200).send({story})
        }
        story = await Story.findByIdAndUpdate(storyId, {viewedBy: [...story.viewedBy, req.user.id]}, {new: true})
        return res.status(200).send({story})
    }catch(err){
        return res.status(500).send('Something happened.')
    }
}
