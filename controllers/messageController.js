const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const cloudinary = require('cloudinary').v2;

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;

    let conversation = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Chat({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || '',
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    // const recipientSocketId = getRecipientSocketId(recipientId);
    // if (recipientSocketId) {
    //   io.to(recipientSocketId).emit('newMessage', newMessage);
    // }

    res.status(201).json({ newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET CHAT
const getChat = async (req, res) => {
  const userId = req.user._id;
  try {
    const conversations = await Chat.find({ participants: userId }).populate({
      path: 'participants',
      select: 'username name profilePic',
    });

    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json({ conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET MESSAGES
const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getChat,
};
