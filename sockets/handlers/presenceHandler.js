const { ObjectId } = require('mongodb');
const { getDB } = require('../../config/db');

module.exports = function registerPresenceHandlers(io, socket) {
  // On connect: mark online, notify their conversations
  (async () => {
    const db = getDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(socket.userId) },
      { $set: { status: 'online' } }
    );

    const conversations = await db.collection('conversations')
      .find({ members: new ObjectId(socket.userId) })
      .toArray();

    conversations.forEach((c) => {
      socket.join(c._id.toString());
      socket.to(c._id.toString()).emit('presence:update', {
        userId: socket.userId,
        status: 'online',
      });
    });
  })();

  socket.on('disconnect', async () => {
    const db = getDB();
    const lastSeenAt = new Date();
    await db.collection('users').updateOne(
      { _id: new ObjectId(socket.userId) },
      { $set: { status: 'offline', lastSeenAt } }
    );

    const conversations = await db.collection('conversations')
      .find({ members: new ObjectId(socket.userId) })
      .toArray();

    conversations.forEach((c) => {
      socket.to(c._id.toString()).emit('presence:update', {
        userId: socket.userId,
        status: 'offline',
        lastSeenAt,
      });
    });
  });
};