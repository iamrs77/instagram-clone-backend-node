let jwt = require('jsonwebtoken')
require('dotenv').config();
const User = require('../models/user');

function authenticateUserToken (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]
    if(token == null){
        return res.status(401).send({error: 'Access Denied'})
    }

    jwt.verify(token,  process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if(err){
            return res.status(403).send({error: 'Access Denied'})
        }
        const foundUser = await User.findById(user.id);
        if(foundUser){
            req.user = user;
            next();
        } else {
            return res.status(403).send({error: 'Access Denied'})
        }
    })

}

module.exports = authenticateUserToken;