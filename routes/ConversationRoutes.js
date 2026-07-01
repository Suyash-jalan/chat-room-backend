const express = require("express");
const router = express.Router();
const auth= require('../middleware/auth');
const conversationsController = require('../controllers/conversationController');
const messageController = require('../controllers/messageController');

router.post('/', auth, conversationsController.create);
router.get('/', auth, conversationsController.list);
router.get('/:id', auth, conversationsController.getOne);
router.post('/:id/members', auth, conversationsController.addmember);
router.get('/:id/messages', auth, messageController.history);
router.post('/:id/messages', auth, messageController.send);


module.exports = router;
