const express = require("express");
const router = express.Router();
const auth= require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.patch('/:id/read',auth,messageController.markRead);


module.exports = router;