const express = require('express');
const router = express.Router();
const Chat = require('./models/Chat');

router.get('/', (req, res) => {
  res.send('server is up and running');
});

router.get('/chats', (req, res) => {
  Chat.find()
    .populate('sender')
    .then(chats => {
      if (!chats) return res.status(400).json({ success: false, msg: 'Chats not found' })

      res.status(200).json({ success: true, chats })
    })
})

module.exports = router