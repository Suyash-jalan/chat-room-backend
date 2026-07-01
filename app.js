const express = require('express');
const cors = require('cors');
const sessionMiddleware = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const conversationsRoutes = require('./routes/ConversationRoutes');
const messagesRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(sessionMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use(errorHandler);

module.exports = app;

