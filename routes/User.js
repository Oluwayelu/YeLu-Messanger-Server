const router = require('express').Router()
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path')
const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET

router.get('/', (req, res) => {
  User.find({}, { password: 0 })
    .then(users => {
      if (!users) return res.status(400).json({ msg: 'Users not found ' })

      res.status(200).json({ success: true, users })
    })
});

router.post(
  '/',
  (req, res) => {
    const { name, email, username, password } = req.body

    User.findOne({ email })
      .then(user => {
        if (user) return res.status(400).json({ success: false, msg: 'Email is taken' })

        User.findOne({ username })
          .then(user => {
            if (user) return res.status(400).json({ success: false, msg: 'Username is taken' })

            const newUser = new User({
              name,
              email,
              username,
              password
            })

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err
                newUser.password = hash

                newUser.save()
                  .then(() => {
                    res.status(200).json({ success: true, msg: 'User Registered' })
                  })
                  .catch(err => res.status(400).json({ success: false, msg: 'Error Occured', err }))
              })
            })
          })
          .catch(err => res.status(400).json({ success: false, msg: 'Error Occured', err }))
      })
      .catch(err => res.status(400).json({ success: false, msg: 'Error Occured', err }))
  })

router.post(
  '/login',
  (req, res) => {
    const { login, password } = req.body

    User.findOne({ email: login })
      .then(user => {
        if (!user) {
          User.findOne({ username: login })
            .then(user => {
              if (!user) return res.status(400).json({ success: false, msg: 'User Credentials Wrong' })

              bcrypt.compare(password, user.password, (err, isMatch) => {
                if (!isMatch) return res.status(400).json({ success: false, msg: 'Password Incorrect' })

                const payload = {
                  id: user._id,
                  name: user.name,
                  username: user.username,
                  avatar: user.avatar
                }

                jwt.sign(
                  payload,
                  jwtSecret,
                  { expiresIn: 3600 },
                  (err, token) => {
                    if (err) return res.status(400).json({ success: false, msg: 'Error occured while creating a token' })
                    res.status(200).json({
                      success: true,
                      token: `Bearer ${token}`,
                      payload
                    })
                  }
                )
              })
            })
        } else {

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) return res.status(400).json({ success: false, msg: 'Password Incorrect' })

            const payload = {
              id: user._id,
              name: user.name,
              username: user.username,
              avatar: user.avatar
            }

            jwt.sign(
              payload,
              jwtSecret,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) return res.status(400).json({ success: false, msg: 'Error occured while creating a token' })
                res.status(200).json({
                  success: true,
                  token: `Bearer ${token}`
                })
              }
            )
          })
        }
      })
      .catch(err => res.status(400).json({ success: false, msg: 'Error Occured', err }))
  });

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {

    User.findById(req.user.id, { password: 0 })
      .then(user => {
        req.io.sockets.emit('user', user)
        res.status(200).json({
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          username: user.username
        });
      })
      .catch(err => res.status(400).json(err))
  }
);

router.post(
  '/avatar',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {

    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/avatar')
      },
      filename: (req, file, cb) => {
        cb(null, `avatar_${Date.now()}_${file.originalname}`)
      },
      fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' && ext !== '.png') {
          return cb(res.status(400).end('Only jpg, png, mp4 is allowed'), false)
        }
        cb(null, true)
      }
    })

    var upload = multer({ storage }).single("avatar")

    upload(req, res, err => {
      if (err) return res.status(400).json({ success: false, err })

      User.findByIdAndUpdate(
        req.user.id,
        { avatar: res.req.file.path },
        { new: true }
      )
        .then(() => {
          res.status(200).json({ success: true, msg: 'Avatar updated', url: res.req.file.path })
        })
        .catch(err => res.status(400).json({ success: false, err }))
    })
  }
)

router.put(
  '/password',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { email } = req.body
    User.find({ email })
      .then(user => {

      })
  }
)

module.exports = router