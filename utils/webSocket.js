import Chat from '../models/Chat.js';
import logger from '../config/logger.js';

export const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info('New WebSocket connection');

    socket.on('join', ({ userId }) => {
      socket.join(userId);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        let chat = await Chat.findOne({
          participants: { $all: [senderId, receiverId] }
        });

        if (!chat) {
          chat = new Chat({
            participants: [senderId, receiverId],
            messages: []
          });
        }

        chat.messages.push({ sender: senderId, content });
        await chat.save();

        io.to(receiverId).emit('message', { senderId, content });
        logger.info(`Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info('WebSocket disconnected');
    });
  });
};