const User = require('../models/user');
const jwt = require('jsonwebtoken');
const upload = require('../helpers/file-upload')
const dotenv = require('dotenv');
const user = require('../models/user');
dotenv.config();

const singleUpload = upload.single('image')

var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function isValidEmail(email) {
    if (!email) return false;
    if(email.length > 254) return false;
    if(!emailRegex.test(email)) return false;
    let parts = email.split("@");
    if(parts[0].length > 64) return false;
    let domainParts = parts[1].split(".");
    if(domainParts.some(function(part) { return part.length > 63; })) return false;
    return true;
}

exports.signup = async(req, res) => {
    const _email = req.body.email.toLowerCase();
    const _username = req.body.username;
    if(_email && isValidEmail(_email)) {
        const user = await User.findOne({ $or: [{email: _email}, {username: _username}]});
        if(user) {
            return res.status(400).send({errorMsg: 'An account already exists with this email/username'});
        } else {
            if(req.body.password.length < 5) {
                return res.status(400).send({errorMsg: 'Password should be atleast 5 characters'});
            }
            if(_email && req.body.username && req.body.firstName && req.body.lastName && req.body.password){
                const user = new User(req.body);
                user.displayPic = "https://insta-image-uploads.s3.ap-south-1.amazonaws.com/1609997154346"
                await User.create(user, async(err, data) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    const payload = {
                        id: data._id,
                        email: data.email,
                        username: data.username,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        displayPic: data.displayPic
                    }
                    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 24*60*60 });
                    return res.status(201).send({accessToken});
                })
            } else {
                return res.status(400).send({errorMsg: 'Please enter all the required details'});
            }
        }
    } else {
        return res.status(400).send({errorMsg: 'Email is invalid'});
    }
}

exports.updateUserDetails = async (req, res) => {
    req.body.newDetails.email = req.body.newDetails.email.toLowerCase()
    try{
        if(!isValidEmail(req.body.newDetails.email))
            throw new Error('Please enter a valid email.')
        if(req.user.email!==req.body.newDetails.email){
            const user = await User.find({email: req.body.newDetails.email})
            if(user.length>0){
                throw new Error('This email is already taken.')
            }
        }
        if(req.user.username!==req.body.newDetails.username){
            const user = await User.find({username: req.body.newDetails.username})
            if(user.length>0){
                return res.status(400).send({errorMsg: 'This username is already taken.'})
            }
        }
        const user = await User.findByIdAndUpdate(req.user.id, 
            {username: req.body.newDetails.username,
            email: req.body.newDetails.email,
            firstName: req.body.newDetails.firstName,
            lastName: req.body.newDetails.lastName,
            bio: req.body.newDetails.bio
        }, {new: true,fields:'-password' ,populate: 'posts'})
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            displayPic: user.displayPic
        }
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 24*60*60 });
        res.status(200).send({user, accessToken})
    }catch(err){
        res.status(400).send(err.message)
    }
}

exports.changePassword = async (req, res) => {
    try{
        const username = req.user.username
        const currentPassword = req.body.currentPassword
        const newPassword = req.body.newPassword
        if(newPassword.length < 5) {
            return res.status(400).send({errorMsg: 'Password should be atleast 5 characters'});
        }
        if(username&&currentPassword){
            let user = await User.findOne({username})
            if(!user){
                throw new Error('Something went wrong.')
            }
            let password = currentPassword
            await user.authenticate(password, async (data) => {
                if(!data.res){
                    return res.status(400).send({message: 'Wrong current Password'});
                }
                user.password = newPassword
                user = await user.save()
                const payload = {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayPic: user.displayPic
                }
                const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 24*60*60 });
                return res.status(201).send({accessToken});
            })
            
        }else{
            throw new Error('Provide all details.')
        }
    }catch(err){
        res.status(500).send(err.message)
    }
}

exports.signin = async(req, res) => {
    const { username, password } = req.body;
    if(username && password) {
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(400).send({errorMsg: 'User does not exist'});
        }
        user.authenticate(password, async (data) => {
            if(!data.res){
                return res.status(400).send({errorMsg: 'Wrong Password'});
            }
            const payload = {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                displayPic: user.displayPic
            }
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 24*60*60 });
            return res.status(201).send({accessToken});
        })
    } else {
        return res.status(400).send({errorMsg: 'Please enter valid username and password'});
    }
}

exports.changeDP = async (req, res) => {
    singleUpload(req, res, async function(err){
            if(err){
                res.status(422).send({
                    error: err.message 
                })
            }
            try{
                let user = await User.findById(req.user.id)
                if(!user){
                    res.status(400).send({errMsg: "Invalid user"})
                }
                user = await User.findByIdAndUpdate(req.user.id, 
                    {displayPic: req.file?req.file.location:"https://insta-image-uploads.s3.ap-south-1.amazonaws.com/1609997154346"},
                    {new: true})
                res.status(200).send({displayPic: user.displayPic})
            }catch(err){
                res.status(500).send(err.message)
            }
        }
    )}

exports.getUserData = async (req, res) => {
    try{
        const user = await User.find({username: req.params.username}).select('username firstName lastName displayPic email bio').populate('posts')
        res.status(200).send(user[0])
    }catch(err){
        res.status(500).send(err.message)
    }
}

