module.exports = function registerTypingHandlers(io, socket) {
  socket.on('typing:start', ({ conversationId }) => {
    socket.to(conversationId).emit('typing:update', {
      userId: socket.userId,
      username: socket.username,
      typing: true,
    });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(conversationId).emit('typing:update', {
      userId: socket.userId,
      username: socket.username,
      typing: false,
    });
  });
};