const bcrypt = require("bcrypt");
const User = require("../models/User");

async function singup(req, res, next) {
    try{
        const {username, email, password}= req.body;
        
        if(!username || !email || !password){
            return res.status(400).json({message: "Please provide username, email and password"});
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({username, email, password});

        req.session.userId = user._id.toString();
        req.session.username = user.username;

        return res.status(201).json({message: "User registered successfully"});
    }catch (err) {
        if(err.code == 11000){
            return res.status(400).json({message: "User already exists"});
        }
        next(err);
    }
}

async function login(req, res, next) {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email: email});
        if(!user){
            return res.json(400, {message: "user not present"});
        }
        
        const valid = await bcrypt.compare(password, user.passwordHash);

        if(!valid){
            return res.json(401, {message: "invalid password"})
        }

        req.session.userId = user._id.toString();
        req.session.username = user.username;

        res.status(200).json({message: "User logged in successfully"});

    }catch (err){
        next(err);
    }
}

async function logout(req, res,next) {
    req.session.destroy( (err) => {
        if(err) return next(err);
        res.clearCookie("sid");
        res.status(200).json({message: "User logged out successfully"});
    })
}

module.exports = { singup, login, logout};