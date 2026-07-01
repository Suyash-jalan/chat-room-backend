const { Server } = require('socket.io');
const registerMessageHandlers = require('./handlers/messageHandlers');
const registerPresenceHandlers = require('./handlers/presenceHandler');
const registerTypingHandlers = require('./handlers/typingHandler');
const sessionMiddleware = require('../config/session');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    },
  });

  // Use session middleware to access socket.request.session
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  // Authenticate socket using session
  io.use((socket, next) => {
    const session = socket.request.session;
    if (!session || !session.userId) {
      return next(new Error('Authentication required'));
    }
    socket.userId = session.userId;
    socket.username = session.username;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.username} (${socket.id})`);
    socket.join(socket.userId);

    registerPresenceHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.username}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized — call initSocket() first');
  return io;
}

module.exports = { initSocket, getIO };