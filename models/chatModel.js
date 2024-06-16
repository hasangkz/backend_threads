const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
