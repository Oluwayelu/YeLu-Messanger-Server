const express = require('express');
const socketIo = require('socket.io');
const passport = require('passport');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const http = require('http');
const cors = require('cors');

dotenv.config()

const { addUser, removeUser, getUser, getUserInRoom } = require('./users')

const PORT = process.env.PORT || 5000
const db = process.env.DATABASE

const router = require('./router')
const user = require('./routes/User')
const chat = require('./routes/Chat')
const room = require('./routes/Rooms')

const passportConfig = require('./middleware/passport')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(passport.initialize())
passportConfig(passport)

mongoose.connect(db,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err))

// io.on('connection', (socket) => {
//   socket.on('user', (user) => {
//     console.log(user)
//   })


//   socket.on('join', ({ name, room }, callback) => {
//     const { error, user } = addUser({ id: socket.id, name, room });

//     if (error) return callback(error)

//     socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to the room ${user.room}` });
//     socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` })

//     socket.join(user.room);

//     io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room) })

//     callback();
//   });

//   socket.on('sendMessage', (message, callback) => {

//     const user = getUser(socket.id);

//     io.to(user.room).emit('message', { user: user.name, text: message });
//     io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room) });

//     callback()
//   })

//   socket.on('disconnect', () => {
//     const user = removeUser(socket.id)
//     console.log('User disconnected')

//     if (user) {
//       io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
//     }
//   })
// })

app.use((req, res, next) => {
  let sock
  io.on('connection', (socket) => {
    sock = socket
  })
  req.sock = sock
  req.io = io;
  next();
});

app.use('/uploads/avatar/default', express.static('uploads/avatar/default'));
app.use('/uploads/avatar/admin', express.static('uploads/avatar/admin'));
app.use('/uploads/avatar', express.static('uploads/avatar'));
app.use('/uploads/files', express.static('uploads/files'));

app.use(router)
app.use('/api/user', user)
app.use('/api/chat', chat)
app.use('/api/room', room)

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`)); 