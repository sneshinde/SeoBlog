const User = require('../models/user');
const shortId = require('shortId');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

exports.read = (req, res) =>{
    req.profile.hashed_password = undefined; //don't pass hashpassword
    return res.json(req.profile);
}