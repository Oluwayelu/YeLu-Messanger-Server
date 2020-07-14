const router = require('express').Router()
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path')
const passport = require('passport');
const jwt = require('jsonwebtoken');

const Room = require('../models/Room');

const jwtSecret = process.env.JWT_SECRET

router.get('/', (req, res) => {
  Room.find({}, { password: 0 })
    .populate(['creator', 'members'])
    .then(rooms => {
      if (!rooms) return res.status(400).json({ msg: 'Rooms not found ' })

      res.status(200).json({ success: true, rooms })
    })
});

router.get(
  '/myrooms',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Room.find({ creator: req.user.id }, { password: 0 })
      .populate('creator', { 'password': 0 })
      .then(room => {
        if (!room) return res.status(400).json({ msg: 'Rooms created by you not found ' })

        res.status(200).json({ success: true, room })
      })
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { name, password } = req.body
    Room.findOne({ name })
      .then(room => {
        if (room) return res.status(400).json({ success: false, msg: 'Room Name is taken already' })

        const newRoom = new Room({
          name,
          creator: req.user.id
        })

        if (password) {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              newRoom.password = hash

              newRoom.save()
                .then(() => {
                  res.status(200).json({ success: true, msg: 'Room Created', room })
                })
            })
          })
        } else {
          newRoom.save()
            .then(() => {
              res.status(200).json({ success: true, msg: 'Room Created' })
            })
        }
      })
  }
);

router.post(
  '/join',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { name, password } = req.body
    Room.findOne({ name })
      .then(room => {
        if (!room) return res.status(400).json({ success: false, msg: 'Room does not exist' })
        if (room.creator.toString() === req.user.id) return res.status(400).json({ success: false, msg: 'You created Room' })
        if (room.members.filter(member => member.toString() === req.user.id).length > 0) {
          return res.status(400).json({ success: false, msg: 'You are already a member of this room' })
        }
        if (room.password) {
          bcrypt.compare(password, room.password, (err, isMatch) => {
            if (!isMatch) return res.status(400).json({ success: false, msg: 'Password Required' })

            room.members.push(req.user.id)
            room.save()
              .then(() => {
                res.status(200).json({ success: true, msg: 'Room Joined', room })
              })
          })
        } else {
          room.members.push(req.user.id)
          room.save()
            .then(() => {
              res.status(200).json({ success: true, msg: 'Room Joined', room })
            })
        }
      })
  }
);

router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {

  }
)

module.exports = router