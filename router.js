const express = require('express');
const router = express.Router();
const Chat = require('./models/Chat');

router.get('/', (req, res) => {
  res.send('server is up and running');
});

router.get('/chats', (req, res) => {
  Chat.find()
    .populate('sender')
})

module.exports = router