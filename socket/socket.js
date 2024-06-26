const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
const userSocketMap = {}; // userId: socketId

const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId != 'undefined') userSocketMap[userId] = socket.id;
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('markMessagesAsSeen', async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );
      await Chat.updateOne(
        { _id: conversationId },
        { $set: { 'lastMessage.seen': true } }
      );
      io.to(userSocketMap[userId]).emit('messagesSeen', { conversationId });
    } catch (error) {
      console.log('error in markMessagesAsSeen', error);
    }
  });

  socket.on('disconnect', () => {
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

module.exports = { io, server, app, getRecipientSocketId };
