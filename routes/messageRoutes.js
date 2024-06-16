const express = require('express');
const handleAuth = require('../middlewares/handleAuth');
const {
  sendMessage,
  getChat,
  getMessages,
} = require('../controllers/messageController');

const router = express.Router();

router.post('/', handleAuth, sendMessage);
router.get('/conversations', handleAuth, getChat);
router.get('/:otherUserId', handleAuth, getMessages);

module.exports = router;
