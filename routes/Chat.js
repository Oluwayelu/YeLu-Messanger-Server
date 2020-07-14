const router = require('express').Router()
const passport = require('passport')
const Chat = require('../models/Chat');
const Room = require('../models/Room')

router.get('/', (req, res) => {

  Chat.find()
    .populate(['sender', 'room'])
    .then(chats => {
      if (!chats) return res.status(400).json({ success: false, msg: 'Chats not found' })

      res.status(200).json({ success: true, chats })
    })
})

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { room, message, type } = req.body

    Room.findById(room)
      .then(room => {
        if (!room) return res.status(400).json({ success: false, msg: 'Room does not exist' })

        const newChat = new Chat({
          sender: req.user.id,
          room,
          message,
          type
        })

        newChat.save()
          .then(() => {
            res.status(200).json({ success: true, msg: 'Message Saved' })
          })
      })
  }
)

module.exports = router