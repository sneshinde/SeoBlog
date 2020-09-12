const User = require('../models/user');
const Blog = require('../models/blog');
const shortId = require('shortId');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.signup = (req, res) => {
    console.log("n server signup");
    User.findOne({ email: req.body.email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is Taken'
            });
        }
    })
   // console.log(user);
    const { name, email, password } = req.body;
    let userName = shortId.generate();
    let profile = `${process.env.CLIENT_URL}/profile/${userName}`;

    let newUser = new User({ name, email, password, profile, userName });
    newUser.save((err, success) => {
        console.log("in save user call");
        console.log(err);
        if (err) {
            return res.status(400).json({
                error: err
            })
        } else {
            return res.json({
                message: 'Signup sucess ! Please Signin.'
            })
        }
    });
};

exports.signin = (req, res) => {
    //check if user exist
    const { email, password } = req.body;
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email doesnot exists,Please Signup.'
            });
        }
        //authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email/Password do not match.'
            });
        }

        //generate a json web token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { expiresIn: '1d' });
        const { _id, userName, name, role } = user;
        return res.json({
            token, 
            user: { _id, userName, name, role }
        });
    });
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "signout successful!"
    });
};

exports.requireSignin = expressJwt({
    secret: 'DKLSJFNWEFLIUWNKW3123KLFJIOEWI'
}),

exports.authMiddlemare = (req, res, next) => {   //to make user profile available
    console.log("in auth middleware");

    console.log(req.user);

    const authUserId = req.user._id;
    User.findById({_id: authUserId}).exec((err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    })
}

exports.adminMiddlemare = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findById({_id: adminUserId}).exec((err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if(user.role !== 1){
            return res.status(400).json({
                error: 'Admin resource, Access denied'
            });
        }
        req.profile = user;
        next();
    })
}
exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'You are not authorized'
            });
        }
        next();
    });
};