const express = require("express");
const authrouter = express.Router();
const auth= require('../middleware/auth');
const authController = require("../controllers/authController");

authrouter.post("/singup", authController.singup);
authrouter.post("/login", authController.login);
authrouter.post("/logout", auth, authController.logout);
router.get('/me', auth, (req, res) => res.json({ user: req.user }));


module.exports = authrouter;
