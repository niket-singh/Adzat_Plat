import Chat from '../models/Chat.js';

export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name')
      .sort('-updatedAt');
    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, receiverId],
        messages: []
      });
    }

    chat.messages.push({
      sender: req.user.id,
      content
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
};