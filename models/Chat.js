const { Schema, model } = require('mongoose');

const ChatSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'rooms'
  },
  message: {
    type: String
  },
  type: {
    type: String,
    default: 'TEXT',
    enum: ['TEXT', 'IMAGE', 'VIDEO']
  }
}, {
  timestamps: true
});

module.exports = model('chats', ChatSchema);