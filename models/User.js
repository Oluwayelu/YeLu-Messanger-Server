const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  avatar: {
    type: String
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('users', UserSchema);