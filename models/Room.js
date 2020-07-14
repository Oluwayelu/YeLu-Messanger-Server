const { Schema, model } = require('mongoose');

const RoomSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  ]
}, {
  timestamps: true
});

module.exports = model('rooms', RoomSchema);