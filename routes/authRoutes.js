const express = require("express");
const authrouter = express.Router();
const auth= require('../middleware/auth');
const authController = require("../controllers/authController");

authrouter.post("/signup", authController.signup);
authrouter.post("/login", authController.login);
authrouter.post("/logout", auth, authController.logout);
authrouter.get('/me', auth, (req, res) => res.json({ user: req.user }));
authrouter.get('/users', auth, authController.listUsers);


module.exports = authrouter;
