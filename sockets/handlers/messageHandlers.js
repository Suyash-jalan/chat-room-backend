const { ObjectId } = require('mongodb');
const { getDB } = require('../../config/db');

module.exports = function registerMessageHandlers(io, socket) {
  // Client must explicitly join a conversation's "room" before sending/receiving
  socket.on('conversation:join', async (conversationId) => {
    const db = getDB();
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      members: new ObjectId(socket.userId),
    });
    if (!conversation) {
      return socket.emit('error', { message: 'Not a member of this conversation' });
    }
    socket.join(conversationId); // Socket.IO room = conversationId, simple 1:1 mapping
  });

  socket.on('conversation:leave', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('message:send', async ({ conversationId, text, type = 'text', attachmentUrl }) => {
    const db = getDB();

    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      members: new ObjectId(socket.userId),
    });
    if (!conversation) {
      return socket.emit('error', { message: 'Not a member of this conversation' });
    }

    const message = {
      conversationId: new ObjectId(conversationId),
      senderId: new ObjectId(socket.userId),
      type,
      text: text || null,
      attachmentUrl: attachmentUrl || null,
      readBy: [new ObjectId(socket.userId)],
      createdAt: new Date(),
    };

    const result = await db.collection('messages').insertOne(message);
    const saved = { ...message, _id: result.insertedId };

    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: { text, senderId: message.senderId, sentAt: message.createdAt },
          updatedAt: new Date(),
        },
      }
    );

    // Broadcast to everyone in the room, INCLUDING the sender (so their own UI updates from one source of truth)
    io.to(conversationId).emit('message:new', saved);
  });
};